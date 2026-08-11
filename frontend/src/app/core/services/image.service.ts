import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

interface UploadImageResponse {
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly http = inject(HttpClient);
  private readonly uploadUrl = `${environment.apiUrl}/images/upload`;

  upload(file: File, previousFileName?: string | null) {
  const formData = new FormData();
  formData.append('image', file);
  if (previousFileName) {
    formData.append('previousFileName', previousFileName);
  }
  return this.http.post<UploadImageResponse>(this.uploadUrl, formData);
}

  getImageUrl(fileName: string): string {
    return `${environment.imageUrl}/${fileName}`;
  }
}