import { Component, OnDestroy, OnInit } from '@angular/core';
import { HospitalService } from '../../../services/hospital.service';
import { Hospital } from '../../../models/hospital.model';
import Swal from 'sweetalert2';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { Subscription } from 'rxjs';
import { BusquedasService } from 'src/app/services/busquedas.service';

@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styles: [
  ]
})
export class HospitalesComponent implements OnInit, OnDestroy {

  public hospitales: Hospital[] = [];
  public cargando: boolean = true;
  public imgSubs: Subscription;

  constructor(private hospitalService: HospitalService, private modalImagenService: ModalImagenService, private busquedasService: BusquedasService) { }

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarHospitales();
    this.imgSubs = this.modalImagenService.nuevaImagen.subscribe(img => {
      this.cargarHospitales()
    });
  }

  cargarHospitales(){
    this.cargando = true;
    this.hospitalService.cargarHospitales()
      .subscribe(hospitales => {
        this.cargando = false;
        this.hospitales = hospitales;
      })
  }


  guardarCambios(hospital: Hospital){
    this.hospitalService.actualizarHospital(hospital._id, hospital.nombre)
      .subscribe(resp =>{
        Swal.fire('Actualizad0', hospital.nombre, 'success');
      })
  }

  borrarHospital(hospital: Hospital){
    this.hospitalService.borrarHospital(hospital._id)
      .subscribe(resp =>{
        Swal.fire('Borrado', hospital.nombre, 'success');
      })
  }

  async abrirSweetAlert(){
    const {value = ''} = await Swal.fire<string>({
      title: 'Crear hospital',
      text: 'Ingrese el nombre del nuevo hospital',
      input: 'text',
      inputPlaceholder: 'Nombre del hospital',
      showCancelButton: true
    })
    
    if(value.trim().length > 0) {
      this.hospitalService.crearHospital(value)
        .subscribe((resp: any) => {
          this.hospitales.push(resp.hospital);
        })
    }
  }

  abrirModal(hospital: Hospital){
    this.modalImagenService.abrirModal('hospitales',hospital._id, hospital.img);
  }

  buscar(termino: string){
    if(termino.length === 0){
      return this.cargarHospitales();
    }
    this.busquedasService.buscar('hospitales', termino)
      .subscribe(resultado => {
        this.hospitales = resultado;
      })
  }

}
