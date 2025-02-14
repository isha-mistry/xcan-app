import { optimism } from "@/config/daos/optimismDAO";
import { arbitrum } from "./daos/arbitrumDAO";
import {mantle} from "./daos/mantleDAO";


export const dao_details: Record<string, any> = {
  optimism,
  arbitrum,
  mantle,
};

// function to add more DAOs dynamically
export const addDao = (daoName: string, daoDetails: any) => {
  dao_details[daoName] = daoDetails;
};
