import { Inject, Injectable } from '@angular/core';
import { Contract, ContractInterface, ethers, providers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class ContractService extends Contract {

  constructor(
    @Inject('APP_CONTRACT_ADDRESS') readonly _address: string,
    @Inject('APP_CONTRACT_ABI') readonly _abi: ContractInterface,
    @Inject('APP_WEB3_PROVIDER') readonly _provider: providers.Web3Provider
  ) {
    super(_address, _abi, _provider.getSigner());
  }

  async mintPet(name: string): Promise<any> {
    const value = ethers.utils.parseEther('0.001');
    const tx = await (this as any).adoptPet(name, { value });
    const confirm = await tx.wait();
    const getTokenId = (topic: any) => {
      const hexValue = ethers.utils.hexValue(topic).toString();
      return Number(hexValue);
    };
    const tokenId = getTokenId(confirm.logs[0].topics[3]);
    return { tx, confirm, tokenId };
  }

  async feedPet(tokenId: string | number): Promise<any> {
    const value = ethers.utils.parseEther('0.0001');
    const tx = await (this as any).feed(tokenId, { value });
    await tx.wait();
    return tx;
  }

  async playPet(tokenId: string | number): Promise<any> {
    const value = ethers.utils.parseEther('0.0001');
    const tx = await (this as any).play(tokenId, { value });
    await tx.wait();
    return tx;
  }

  async restPet(tokenId: string | number): Promise<any> {
    const value = ethers.utils.parseEther('0.0001');
    const tx = await (this as any).rest(tokenId, { value });
    await tx.wait();
    return tx;
  }

  async isOwnerOf(address: string, tokenId: string | number): Promise<boolean> {
    const owner = await (this as any).ownerOf(tokenId).catch(() => false);
    return String(owner).toLowerCase() === String(address).toLowerCase();
  }

  async getStats(tokenId: number | string): Promise<any> {
    const stats = await (this as any).petStats(tokenId);
    return {
      foodLevel: stats.foodLevel.toNumber(),
      restLevel: stats.sleepLevel.toNumber(),
      happyLevel: stats.happyLevel.toNumber(),
    };
  }
}
