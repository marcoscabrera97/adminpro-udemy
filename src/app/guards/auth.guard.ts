import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private usaurioService: UsuarioService, private router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      return this.usaurioService.validarToken()
      .pipe(
        tap((estaAutenticado: any) => {
          if(!estaAutenticado){
            this.router.navigateByUrl('/login');
          }
        })
      );
    }
}
