import { useMemo } from 'react';
import {daoConfigs} from "../../config/daos";
import type { DAOConfig } from '../../types/dao';

export function useDAO(daoName: string): DAOConfig | null {
  return useMemo(() => {
    return daoConfigs[daoName] || null;
  }, [daoName]);
}