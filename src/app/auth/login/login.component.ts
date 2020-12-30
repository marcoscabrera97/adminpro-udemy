import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario.service';

declare const gapi: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {

  public formSubmitted = false;
  public auth2: any;

  public loginForm = this.fb.group({
    email: [localStorage.getItem('email') || '', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(3) ]],
    remember: [false]
  });

  constructor( private router: Router, private fb: FormBuilder, private usuarioService: UsuarioService, private ngZone: NgZone ) { }
  
  ngOnInit(): void {
    this.renderButton();
  }


  login() {
    this.usuarioService.login(this.loginForm.value)
    .subscribe(resp => {

      if(this.loginForm.get('remember').value){
        localStorage.setItem('email', this.loginForm.get('email').value);
      }else{
        localStorage.removeItem('email');
      }
      console.log('fin');
      this.router.navigateByUrl('/');
    }, (err) => {
      // Si sucede un error
      Swal.fire('Error', err.error.msg, 'error');
    })
  }  

  renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark'
    });
    this.startApp();
  }
  
  async startApp() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: '745141160224-f68ajecrpsmnbuvlff32muh1dtiu63cd.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      });
      this.attachSignin(document.getElementById('my-signin2'));
    });
  };

  attachSignin(element) {
    this.auth2.attachClickHandler(element, {},
        (googleUser) => {
          var id_token = googleUser.getAuthResponse().id_token;
          this.usuarioService.loginGoogle(id_token).subscribe(resp => {
            this.ngZone.run(() => {
              this.router.navigateByUrl('/');
            })
          });
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
  }

}
