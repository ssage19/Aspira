import React from 'react';
import { formatCurrency } from '../lib/utils';

interface PropertyCardProps {
  property: any;
  position?: [number, number, number];
}

// Simple PropertyCard component with no 3D elements
export function PropertyCard({ property, position }: PropertyCardProps) {
  // This component is no longer used in the simplified MainScene
  // It's kept as a placeholder to prevent import errors
  return null;
}

export default PropertyCard;
