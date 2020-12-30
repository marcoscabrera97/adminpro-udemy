import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
declare const gapi: any;const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any;

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
    this.googleInit();
  }

  googleInit(){
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: '745141160224-f68ajecrpsmnbuvlff32muh1dtiu63cd.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      });
    });
  }

  logout(){
    localStorage.removeItem('token');
    this.auth2.signOut().then(() => {
        this.ngZone.run(() => {
          this.router.navigateByUrl('/login');
        })
    });
  }

  validarToken(): Observable<Boolean>{
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }
    }).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
      }),
      map(resp => true),
      catchError(error => of(false))
    )
  }

  crearUsuario(formData: RegisterForm) {
    return this.http.post(`${base_url}/usuarios`, formData)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('token', resp.token);
        })
  )
  }

  login(formData: LoginForm){
    return this.http.post(`${base_url}/login`, formData)
        .pipe(
            tap((resp: any) => {
              localStorage.setItem('token', resp.token);
            })
        )
  }

  loginGoogle(token){
    return this.http.post(`${base_url}/login/google`, {token})
        .pipe(
            tap((resp: any) => {
              localStorage.setItem('token', resp.token);
            })
        )
  }
}
