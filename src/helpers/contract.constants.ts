import { PIKACHU_ADDRESS } from './address.constants';
import { ethersProvider } from './provider.constants';
import { Pikachu__factory } from './typechain-types';

export const PikachuContract = Pikachu__factory.connect(
  PIKACHU_ADDRESS,
  ethersProvider,
);
