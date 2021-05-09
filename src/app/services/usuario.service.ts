import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';
declare const gapi: any;const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any;
  public usuario: Usuario;

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
    this.googleInit();
  }

  
  get token(): string{
    return localStorage.getItem('token') || '';
  }
  
  get role(): 'ADMIN_ROLE' | 'USER_ROLE'{
    return this.usuario.role;
  }

  get uid(): string{
    return this.usuario.uid || '';
  }

  get headers(){
    return {
      headers: {
        'x-token': this.token
      }
    }
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

    localStorage.removeItem('menu');

    this.auth2.signOut().then(() => {
        this.ngZone.run(() => {
          this.router.navigateByUrl('/login');
        })
    });
  }

  guardarLocalStorage(token: string, menu: string){
    localStorage.setItem('token', token);
    if (menu != undefined){
      localStorage.setItem('menu', menu);
    }
  }

  validarToken(): Observable<Boolean>{
    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': this.token
      }
    }).pipe(
      map((resp: any) => {
        const {
          email,
          google,
          nombre,
          role,
          img = '',
          uid
        } = resp.usuario;
        this.usuario = new Usuario(nombre, email, '', img, google, role, uid);
        this.guardarLocalStorage(resp.token, JSON.stringify(resp.menu));
        return true;
      }),
      catchError(error => of(false))
    )
  }

  crearUsuario(formData: RegisterForm) {
    return this.http.post(`${base_url}/usuarios`, formData)
      .pipe(
        tap((resp: any) => {
          this.guardarLocalStorage(resp.token, JSON.stringify(resp.menu));
        })
    )
  }

  actualizarPerfil(data:{email:string, nombre:string, role: string}){
    data = {
      ...data,
      role: this.usuario.role
    }
    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, this.headers);
  }

  login(formData: LoginForm){
    return this.http.post(`${base_url}/login`, formData)
        .pipe(
            tap((resp: any) => {
              this.guardarLocalStorage(resp.token, JSON.stringify(resp.menu));
            })
        )
  }

  loginGoogle(token){
    return this.http.post(`${base_url}/login/google`, {token})
        .pipe(
            tap((resp: any) => {
              this.guardarLocalStorage(resp.token, JSON.stringify(resp.menu));
            })
        )
  }

  cargarUsuarios(desde: number = 0){
    const url = `${base_url}/usuarios?desde=${desde}`;
    console.log(url);
    return this.http.get<CargarUsuario>(url, this.headers)
      .pipe(
        map(resp => {
          const usuarios = resp.usuarios.map(
            user => new Usuario(user.nombre, user.email, '', user.img, user.google, user.role, user.uid)            
          );
          return {
            total: resp.total,
            usuarios
          }
        })
      )
  }

  eliminarUsuario( usuario: Usuario ) {
    const url = `${ base_url }/usuarios/${ usuario.uid }`;
    return this.http.delete( url, this.headers );
  }

  guardarUsuario(usuario: Usuario){
    return this.http.put(`${base_url}/usuarios/${usuario.uid}`, usuario, this.headers);
  }
}
