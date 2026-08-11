import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { Chart, registerables } from 'chart.js';
import { ReporteFinancieroProfesional } from '../models/reporte.model';

Chart.register(...registerables);

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendientes',
  ACEPTADA: 'Aceptadas',
  RECHAZADA: 'Rechazadas',
  CANCELADA: 'Canceladas',
  COMPLETADA: 'Completadas',
};

@Injectable({ providedIn: 'root' })
export class ExcelReporteService {
  //Recibe el reporte desde el ts de page
  async generarReporteFinancieroProfesional(
    reporte: ReporteFinancieroProfesional
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FotoPro';
    workbook.created = new Date();
    
    //Metodos de construccion
    this.construirHojaResumen(workbook, reporte);
    this.construirHojaDetalle(workbook, reporte);
    await this.construirHojaGrafico(workbook, reporte);

    const buffer = await workbook.xlsx.writeBuffer();
    const nombreArchivo = `reporte-financiero-${reporte.profesional.apellidos}-${Date.now()}.xlsx`;
    this.descargarArchivo(buffer, nombreArchivo);
  }

  // -------------------------------------------------
  // Hoja 1: Resumen
  // -------------------------------------------------
  private construirHojaResumen(
    workbook: ExcelJS.Workbook,
    reporte: ReporteFinancieroProfesional
  ): void {
    const hoja = workbook.addWorksheet('Resumen');
    hoja.columns = [
      { key: 'a', width: 28 },
      { key: 'b', width: 20 },
      { key: 'c', width: 20 },
    ];

    // Encabezado
    hoja.mergeCells('A1:C1');
    hoja.getCell('A1').value = 'FotoPro — Reporte financiero del profesional';
    hoja.getCell('A1').font = { size: 16, bold: true };

    hoja.getCell('A2').value = 'Profesional:';
    hoja.getCell('B2').value = `${reporte.profesional.nombre} ${reporte.profesional.apellidos}`;
    hoja.getCell('A3').value = 'Título profesional:';
    hoja.getCell('B3').value = reporte.profesional.tituloProfesional;
    hoja.getCell('A4').value = 'Fecha de generación:';
    hoja.getCell('B4').value = new Date(reporte.generadoEn);
    hoja.getCell('B4').numFmt = 'dd/mm/yyyy hh:mm';
    ['A2', 'A3', 'A4'].forEach((c) => (hoja.getCell(c).font = { bold: true }));

    // Conteo por estado
    let fila = 6;
    hoja.getCell(`A${fila}`).value = 'Citas por estado';
    hoja.getCell(`A${fila}`).font = { bold: true, size: 13 };
    fila++;

    const filaInicioEstados = fila;
    hoja.getRow(fila).values = ['Estado', 'Cantidad'];
    hoja.getRow(fila).font = { bold: true };
    fila++;

    for (const item of reporte.conteoPorEstado) {
      hoja.getRow(fila).values = [ESTADO_LABELS[item.estado] ?? item.estado, item.cantidad];
      fila++;
    }
    const filaFinEstados = fila - 1;
    fila++;

    // Total de citas (fórmula real de Excel)
    hoja.getCell(`A${fila}`).value = 'Total de citas';
    hoja.getCell(`A${fila}`).font = { bold: true };
    hoja.getCell(`B${fila}`).value = {
      formula: `SUM(B${filaInicioEstados}:B${filaFinEstados})`,
    };
    fila += 2;

    // Calificación
    hoja.getCell(`A${fila}`).value = 'Calificación promedio';
    hoja.getCell(`A${fila}`).font = { bold: true };
    hoja.getCell(`B${fila}`).value = reporte.calificacion.promedio;
    fila++;
    hoja.getCell(`A${fila}`).value = 'Cantidad de reseñas';
    hoja.getCell(`A${fila}`).font = { bold: true };
    hoja.getCell(`B${fila}`).value = reporte.calificacion.cantidadResenas;
    fila += 2;

    // Ingresos mensuales
    hoja.getCell(`A${fila}`).value = 'Ingresos por mes (citas completadas)';
    hoja.getCell(`A${fila}`).font = { bold: true, size: 13 };
    fila++;

    const filaHeaderMensual = fila;
    hoja.getRow(fila).values = ['Periodo', 'Citas completadas', 'Ingresos (₡)'];
    hoja.getRow(fila).font = { bold: true };
    fila++;

    const filaInicioMensual = fila;
    for (const mes of reporte.resumenMensual) {
      hoja.getRow(fila).values = [mes.periodo, mes.citasCompletadas, mes.ingresos];
      hoja.getCell(`C${fila}`).numFmt = '"₡"#,##0.00';
      fila++;
    }
    const filaFinMensual = fila - 1;

    if (reporte.resumenMensual.length > 0) {
      hoja.getCell(`A${fila}`).value = 'Total';
      hoja.getCell(`A${fila}`).font = { bold: true };
      hoja.getCell(`B${fila}`).value = {
        formula: `SUM(B${filaInicioMensual}:B${filaFinMensual})`,
      };
      hoja.getCell(`C${fila}`).value = {
        formula: `SUM(C${filaInicioMensual}:C${filaFinMensual})`,
      };
      hoja.getCell(`C${fila}`).numFmt = '"₡"#,##0.00';
      hoja.getRow(fila).font = { bold: true };
    }

    // Formato condicional: resaltar meses con más ingresos
    if (reporte.resumenMensual.length > 0) {
      hoja.addConditionalFormatting({
        ref: `C${filaInicioMensual}:C${filaFinMensual}`,
        rules: [
          {
            type: 'colorScale',
            cfvo: [{ type: 'min' }, { type: 'max' }],
            color: [{ argb: 'FFF8696B' }, { argb: 'FF63BE7B' }],
          } as ExcelJS.ColorScaleRuleType,
        ],
      });
    }
  }

  // -------------------------------------------------
  // Hoja 2: Detalle de citas
  // -------------------------------------------------
  private construirHojaDetalle(
    workbook: ExcelJS.Workbook,
    reporte: ReporteFinancieroProfesional
  ): void {
    const hoja = workbook.addWorksheet('Detalle de citas');

    hoja.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Cliente', key: 'cliente', width: 28 },
      { header: 'Servicio', key: 'servicio', width: 28 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Monto (₡)', key: 'monto', width: 16 },
    ];

    hoja.getRow(1).font = { bold: true };
    hoja.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F1FB' },
    };

    for (const cita of reporte.detalleCitas) {
      const fila = hoja.addRow({
        id: cita.id,
        fecha: new Date(cita.fecha),
        cliente: cita.cliente,
        servicio: cita.servicio,
        categoria: cita.categoria,
        monto: cita.monto,
      });
      fila.getCell('fecha').numFmt = 'dd/mm/yyyy';
      fila.getCell('monto').numFmt = '"₡"#,##0.00';
    }

    hoja.views = [{ state: 'frozen', ySplit: 1 }]; // congela el encabezado
    hoja.autoFilter = { from: 'A1', to: 'F1' };
  }

  // -------------------------------------------------
  // Hoja 3: Gráfico (imagen, ya que ExcelJS no soporta charts nativos)
  // -------------------------------------------------
  private async construirHojaGrafico(
    workbook: ExcelJS.Workbook,
    reporte: ReporteFinancieroProfesional
  ): Promise<void> {
    const hoja = workbook.addWorksheet('Gráfico');

    if (reporte.resumenMensual.length === 0) {
      hoja.getCell('A1').value = 'No hay datos suficientes para generar un gráfico.';
      return;
    }

    const base64Png = await this.renderizarGraficoComoImagen(reporte);
    const base64Data = base64Png.split(',')[1];

    const imageId = workbook.addImage({
      base64: base64Data,
      extension: 'png',
    });

    hoja.getCell('A1').value = 'Ingresos por mes';
    hoja.getCell('A1').font = { bold: true, size: 14 };

    hoja.addImage(imageId, {
      tl: { col: 0, row: 2 },
      ext: { width: 640, height: 360 },
    });
  }

  private renderizarGraficoComoImagen(
    reporte: ReporteFinancieroProfesional
  ): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 450;

      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: reporte.resumenMensual.map((m) => m.periodo),
          datasets: [
            {
              label: 'Ingresos (₡)',
              data: reporte.resumenMensual.map((m) => m.ingresos),
              backgroundColor: '#378ADD',
            },
          ],
        },
        options: {
          responsive: false,
          animation: false,
          plugins: { legend: { display: false } },
        },
      });

      // Espera un tick para asegurar que Chart.js terminó de dibujar
      setTimeout(() => {
        const base64 = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(base64);
      }, 100);
    });
  }

  private descargarArchivo(buffer: ExcelJS.Buffer, nombreArchivo: string): void {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    window.URL.revokeObjectURL(url);
  }
}