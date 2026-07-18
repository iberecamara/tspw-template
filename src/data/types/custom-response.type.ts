export interface CustomResponseBodyType {
  responseCode: number;
  message?: string;
}

export interface CustomResponseType {
  statusCode: number;
  statusText: string;
  body: CustomResponseBodyType;
}
