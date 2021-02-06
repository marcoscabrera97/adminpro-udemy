import { Component, OnDestroy, OnInit } from '@angular/core';
import { Usuario } from '../../../models/usuario.model';
import Swal from 'sweetalert2';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { BusquedasService } from '../../../services/busquedas.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent implements OnInit, OnDestroy {

  public totalUsuarios: number = 0;
  public usuarios: Usuario[] = [];
  public usuariosTemp: Usuario[] = [];
  public desde: number = 0;
  public cargando: boolean = true;

  public imgSubs: Subscription;

  constructor(private usuarioService:UsuarioService,
              private busquedasService: BusquedasService,
              private modalImagenService: ModalImagenService) { }

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.imgSubs = this.modalImagenService.nuevaImagen.subscribe(img => {
      console.log(img);
      this.cargarUsuarios()
    });
  }

  cargarUsuarios(){
    this.cargando = true;
    this.usuarioService.cargarUsuarios(this.desde)
    .subscribe(({total, usuarios}) => {
      this.totalUsuarios = total;
      if(usuarios.length !== 0){
        this.usuarios = usuarios;
        this.usuariosTemp = usuarios;
        this.cargando = false;
        console.log(this.usuarios);
      }
    })
  }

  cambiarPagina(valor: number){
    this.desde += valor;

    if( this.desde < 0 ){
      this.desde = 0;
    } else if(this.desde > this.totalUsuarios){
      this.desde -= valor;
    }
    this.cargarUsuarios();
  }

  buscar(termino: string){
    if(termino.length === 0){
      return this.usuarios = this.usuariosTemp;
    }
    this.busquedasService.buscar('usuarios', termino)
      .subscribe(resultado => {
        this.usuarios = resultado;
      })
  }

  eliminarUsuario(usuario: Usuario){
    if(usuario.uid === this.usuarioService.uid){
      return Swal.fire('Error', 'No puede borrar este usuario', 'error');
    }

    Swal.fire({
      title: 'Borrar usuario?',
      text: `Está a punto de borrar a ${usuario.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario(usuario)
          .subscribe(
            resp => {
              Swal.fire('Usuario borrado', `${usuario.nombre} fue eliminado correctamente`, 'success')
              this.cargarUsuarios();
            })

      }
    })
  }

  cambiarRole(usuario: Usuario){
    this.usuarioService.guardarUsuario(usuario)
      .subscribe(resp => {
        console.log(resp);
      })
  }

  abrirModal(usuario: Usuario){
    this.modalImagenService.abrirModal('usuarios', usuario.uid, usuario.img);
  }
}
