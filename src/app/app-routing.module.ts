import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './shared/auth.service';
import { AuthGuard } from './shared/auth.guard';

import { SampleTemplateComponent } from './sample-template/sample-template.component'

// import { AuthGuard, IsLogin } from './shared';
const routes: Routes = [
    // { path: '', loadChildren: './layout/layout.module#LayoutModule', canActivate: [AuthGuard] },
    { path: '', loadChildren: './layout/layout.module#LayoutModule', canActivate: [AuthGuard] },
    { path: 'chat', loadChildren: './chatting/chatting.module#ChattingModule' },
    { path: 'login', loadChildren: './login/login.module#LoginModule' },
    { path: 'register', loadChildren: './register/register.module#RegisterModule' },
    // { path: 'error', loadChildren: './server-error/server-error.module#ServerErrorModule' },
    { path: 'access-denied', loadChildren: './access-denied/access-denied.module#AccessDeniedModule' },
    { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' },
    { path: 'logout', loadChildren: './logout/logout.module#LogoutModule' },
    { path: 'redirect', loadChildren : './redirect/redirect.module#RedirectModule'},
    { path : 'sample', component: SampleTemplateComponent},
    { path : '**', redirectTo: 'not-found'}
    // { path: 'permission-denied', loadChildren: './permission-denied/permission-denied.module#PermissionDeniedModule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
