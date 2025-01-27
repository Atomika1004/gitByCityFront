import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RoutesComponent} from './components/main/routes/routes.component';
import {PointsComponent} from './components/main/points/points.component';
import {MainComponent} from './components/main/main.component';
import {RouteEditorComponent} from './components/main/route-editor/route-editor.component';
import {PointsEditorComponent} from './components/main/points-editor/points-editor.component';
import {CreateRouteComponent} from './components/main/create-route/create-route.component';
import {ProfileComponent} from './components/profile/profile.component';
import {CreatePointComponent} from './components/main/create-point/create-point.component';
import {LoginComponent} from './components/login/login.component';
import {RegistrationComponent} from './components/registration/registration.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full' },
  {path: 'login', component: LoginComponent },
  {path: 'registration', component: RegistrationComponent },
  {path: 'main', component: MainComponent,
    children: [
      {path: '', redirectTo: 'routes', pathMatch: 'full'},
      {path: 'routes', component: RoutesComponent},
      {path: 'routes/edit/:id', component: RouteEditorComponent},
      {path: 'routes/create', component: CreateRouteComponent},
      {path: 'points', component: PointsComponent},
      {path: 'points/create', component: CreatePointComponent},
      {path: 'points/edit/:id', component: PointsEditorComponent},
    ],
  },
  {path: 'profile', component: ProfileComponent},
  {path: '**', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
