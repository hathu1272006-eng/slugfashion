import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list-component/product-list-component';
import { Parent } from './parent/parent';
import { ProductDropdownListComponent } from './product-dropdown-list-component/product-dropdown-list-component';
import { ProductListCallServiceComponent } from './product-list-call-service-component/product-list-call-service-component';
import { ProductListCallHttpServiceComponent } from './product-list-call-http-service-component/product-list-call-http-service-component';
import { ProductHttpHandleErrorServiceComponent } from './product-http-handle-error-service-component/product-http-handle-error-service-component';
import { ServiceProductImageEventDetailComponent } from './service-product-image-event-detail/service-product-image-event-detail';
import { ServiceProductImageEventComponent } from './service-product-image-event/service-product-image-event';
import { Ex18CustomerGroup } from './ex18-customer-group/ex18-customer-group';
import { ProductDetailComponent } from './product-detail-component/product-detail-component';
import { ProductListAdvancedComponent } from './product-list-advanced-component/product-list-advanced-component';
import { ProductListSearchComponent } from './product-list-search-component/product-list-search-component';
import { Contact } from './contact/contact';
import { PageNotFoundComponent } from './page-not-found-component/page-not-found-component';
import { authGuard } from './classes/auth.guard';
import { CourseRegistrationComponent } from './course-registration-component/course-registration-component';
import { LoginComponent } from './login-component/login-component';
import { FakeProductComponent } from './fake-product-component/fake-product-component';
import { BooksComponent } from './books-component/books-component';
import { BookDetailComponent } from './book-detail-component/book-detail-component';
import { BookNewComponent } from './book-new-component/book-new-component';
import { BookUpdateComponent } from './book-update-component/book-update-component';
import { BookDeleteComponent } from './book-delete-component/book-delete-component';
import { FashionComponent } from './fashion-component/fashion-component';
import { FashionDetailComponent } from './fashion-detail-component/fashion-detail-component';
import { SearchFashionComponent } from './search-fashion-component/search-fashion-component';
const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'learn-directive', component: ProductListComponent },
  { path: 'component-interaction', component: Parent },
  { path: 'product-dropdown-list', component: ProductDropdownListComponent },
  { path: 'product-list-call-service', component: ProductListCallServiceComponent},
  { path: 'product-list-call-http-servive', component: ProductListCallHttpServiceComponent},
  { path: 'product-http-handle-error-service-component', component: ProductHttpHandleErrorServiceComponent},
  { path: 'service-product-image-event', component: ServiceProductImageEventComponent },
  { path: 'service-product-image-event/:id', component: ServiceProductImageEventDetailComponent },
  { path: 'ex18-customer-group', component: Ex18CustomerGroup },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'products', component: ProductListAdvancedComponent },
  { path: 'searchproduct', component: ProductListSearchComponent },
  { path: 'contacts', component: Contact },
  { path: 'login', component: LoginComponent },
  { path: 'fake-products', component: FakeProductComponent },
  {path:'book-list',component:BooksComponent},
  {path:"book-dtl/:id",component:BookDetailComponent},
  {path:'book-new',component:BookNewComponent},
  {path:'book-update/:id',component:BookUpdateComponent},
  {path:'book-delete',component:BookDeleteComponent},
  {path:'fashion-list',component:FashionComponent},
  {path:'fashion-detail',component:FashionDetailComponent},
  {path:'fashion-detail/:slug',component:FashionDetailComponent},
  {path:'search-fashion',component:SearchFashionComponent},
  {
    path: 'samplenested',
    component: ProductListAdvancedComponent,
    children: [
      { path: 'search', component: ProductListSearchComponent },
      { path: 'detail/:id', component: ProductDetailComponent },
    ],
    },
  {
    path:'lazyinfo' ,
    loadComponent: () =>
      import('./lazy-component/lazy-component')
      .then(c=>c.LazyComponent),
      canActivate:[authGuard]
  },
  { path: 'course-register', component: CourseRegistrationComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
