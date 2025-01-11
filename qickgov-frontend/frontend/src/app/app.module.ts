import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UpdateTabComponent } from './update-tab/update-tab.component';
import { ReleaseService } from './shared/release.-service.service';
import { ReleaseComponent } from './home-page/release/release.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { FormsModule } from '@angular/forms';
import { BookmarkService } from './shared/bookmark.service';
import { ReleaseDetailComponent } from './release-detail/release-detail.component';

const appRoutes: Routes = [
  { path: 'user', component: MainPageComponent },
  { path: 'detail', component: ReleaseDetailComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomePageComponent,
    UpdateTabComponent,
    ReleaseComponent,
    LoginComponent,
    MainPageComponent,
    ReleaseDetailComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule
  ],
  providers: [ReleaseService, BookmarkService],
  bootstrap: [AppComponent]
})
export class AppModule { }
