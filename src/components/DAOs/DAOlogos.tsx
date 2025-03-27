import Image from 'next/image';
import { useDAO } from '../../app/hooks/useDAO';

interface DAOLogoProps {
  daoName: string;
  width?: number;
  height?: number;
  className?: string;
}

export function DAOLogo({ daoName, width = 24, height = 24, className = '' }: DAOLogoProps) {
  const dao = useDAO(daoName);

  if (!dao) return null;

  return (
    <Image
      src={dao.logo}
      alt={`${dao.name} logo`}
      width={width}
      height={height}
      className={`${className} rounded-full`}
    />
  );
}