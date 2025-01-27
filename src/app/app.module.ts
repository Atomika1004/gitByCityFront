import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { YandexMapComponent } from './components/yandex-map/yandex-map.component';
import {HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch} from '@angular/common/http';
import { AngularYandexMapsModule, YaConfig } from "angular8-yandex-maps";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

import { CredentialEditorComponent } from './components/credential-editor/credential-editor.component';
import {MatIconModule} from '@angular/material/icon';
import {CdkDrag, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
import { RouteEditorComponent } from './components/main/route-editor/route-editor.component';
import { RoutesComponent } from './components/main/routes/routes.component';
import { PointsComponent } from './components/main/points/points.component';
import { PointsEditorComponent } from './components/main/points-editor/points-editor.component';
import { MainComponent } from './components/main/main.component';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {
  MatStep,
  MatStepContent,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import { MapComponent } from './components/main/map/map.component';
import { CreateRouteComponent } from './components/main/create-route/create-route.component';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {NgOptimizedImage} from '@angular/common';
import { ProfileComponent } from './components/profile/profile.component';
import { CreatePointComponent } from './components/main/create-point/create-point.component';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf} from "@angular/cdk/scrolling";
import {LoginComponent} from './components/login/login.component';
import {CustomIntepretatorService} from './service/custom-intepretator.service';
import { RegistrationComponent } from './components/registration/registration.component';
const mapConfig: YaConfig = {
  apikey: "2569efe6-8490-428f-930d-2aa9c9595297",
  lang: "ru_RU"
};

@NgModule({
  declarations: [
    AppComponent,
    YandexMapComponent,
    CredentialEditorComponent,
    RouteEditorComponent,
    RoutesComponent,
    PointsComponent,
    PointsEditorComponent,
    MainComponent,
    MapComponent,
    CreateRouteComponent,
    ProfileComponent,
    CreatePointComponent,
    LoginComponent,
    RegistrationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AngularYandexMapsModule.forRoot(mapConfig),
    MatSlideToggleModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    CdkDropList,
    CdkDragHandle,
    CdkDrag,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionModule,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatStepper,
    MatStep,
    MatStepperPrevious,
    MatStepperNext,
    MatStepLabel,
    MatStepContent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgOptimizedImage,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS, useClass: CustomIntepretatorService,
    multi: true
  },
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
