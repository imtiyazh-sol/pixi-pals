import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AppComponent } from './app.component';
import { ToPercentPipe } from './pipes/to-percent.pipe';
import { MainComponent } from './components/main/main.component';
import { CreateComponent } from './components/create/create.component';
import { FormsModule } from '@angular/forms';
import { databaseFactory } from './factories/database.factory';
import { Web3Service } from './services/web3.service';
import { WalletSignerService } from './services/wallet-signer.service';
import { ContractService } from './services/contract.service';
import { providers } from 'ethers';
import PixiPals_artifact from '../artifacts/contracts/pixi-pals.sol/PixiPals.json';
import { PixiPetResolver } from './resolvers/pixi-pet.resolver';
import { AuthComponent } from './components/auth/auth.component';
import { IsAuthGuard } from './guards/is-auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { PixiPetGuard } from './guards/pixi-pet.guard';

@NgModule({
  declarations: [
    AppComponent,
    ToPercentPipe,
    MainComponent,
    CreateComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot(
      [
        {
          path: 'main',
          component: MainComponent,
          canActivate: [
            IsAuthGuard,
            PixiPetGuard
          ],
          resolve: {
            pixiPetTokenId: PixiPetResolver,
          },
        },
        { 
          path: 'auth', 
          component: AuthComponent,
          canActivate: [NoAuthGuard],
          resolve: {
            pixiPetTokenId: PixiPetResolver,
          },
        },
        { path: 'create', component: CreateComponent },
        { path: '', redirectTo: 'auth', pathMatch: 'full' },
      ],
      {
        initialNavigation: 'enabledBlocking',
      }
    ),
  ],
  providers: [
    {
      provide: 'APP_CONTRACT_ADDRESS',
      useValue: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
    // {
    //   provide: 'APP_WEB3_PROVIDER',
    //   useFactory: () => {
    //     const p = (window as any).ethereum;
    //     if (!p) {
    //       throw new Error('No web3 provider');
    //     }
    //     return new providers.Web3Provider(p);
    //   },
    // },
    {
      provide: 'APP_WEB3_PROVIDER',
      useClass: Web3Service
    },
    {
      provide: 'APP_WALLET_SIGNER',
      useClass: WalletSignerService,
      deps: ['APP_WEB3_PROVIDER'],
    },
    {
      provide: 'APP_CONTRACT_ABI',
      useFactory: () => {
        return PixiPals_artifact?.abi || [];
      },
    },
    {
      provide: 'APP_DATABASE',
      useFactory: (d: Document) => {
        const storage = d.defaultView?.localStorage;
        if (!storage) {
          throw new Error('No localStorage');
        }
        return databaseFactory(storage);
      },
      deps: [DOCUMENT],
    },
    {
      provide: 'APP_PIXI_TOKEN_ID',
      useFactory: (database: any) => {
        return async () => await database.getItem('pixiPetTokenId')
      },
      deps: ['APP_DATABASE'],
    },
    {
      provide: 'APP_STATE',
      useFactory: async (database: any) => {
        try {
          const value = await database.getItem('STATE');
          return value;
        } catch (error) {
          console.log('[ERROR]', error);
          return {
            foodLevel: Date.now(),
            restLevel: Date.now(),
            happyLevel: Date.now(),
          };
        }
      },
      deps: ['APP_DATABASE'],
    },
    {
      provide: 'APP_CONTRACT_SERVICE',
      useClass: ContractService,
      deps: ['APP_CONTRACT_ADDRESS', 'APP_CONTRACT_ABI', 'APP_WEB3_PROVIDER'],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
