import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Fashion } from '../classes/Fashion';

@Injectable({
  providedIn: 'root',
})
export class FashionAPIService {
    headers=new HttpHeaders().set("Content-Type","text/plain;charset=utf-8")
    requestOptions:Object={
        headers:this.headers,
        responseType:"text"
      }
    constructor(private _http: HttpClient) { }  
    getFashions():Observable<Fashion[]>
    {      
      return this._http.get("/fashions",this.requestOptions).pipe(
          map(res=>JSON.parse(res as string) as Fashion[]),
          retry(3),
          catchError(this.handleError))
    }
    handleError(error:HttpErrorResponse){
      return throwError(()=>new Error(error.message))
    }
    getFashion(id:string):Observable<Fashion>
    {
      return this._http.get("/fashions/"+id,this.requestOptions).pipe(
          map(res=>JSON.parse(res as string) as Fashion),
          retry(3),
          catchError(this.handleError))
    }
    getFashionBySlug(slug:string):Observable<Fashion>
    {
      return this._http.get("/fashions/slug/"+encodeURIComponent(slug),this.requestOptions).pipe(
          map(res=>JSON.parse(res as string) as Fashion),
          retry(3),
          catchError(this.handleError))
    }
}


