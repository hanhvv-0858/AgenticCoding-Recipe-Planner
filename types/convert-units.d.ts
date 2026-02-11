declare module 'convert-units' {
    export type VolumeUnits = 'mm3' | 'cm3' | 'ml' | 'l' | 'kl' | 'm3' | 'km3' | 'tsp' | 'Tbs' | 'in3' | 'fl-oz' | 'cup' | 'pnt' | 'qt' | 'gal' | 'ft3' | 'yd3'

    export type MassUnits = 'mcg' | 'mg' | 'g' | 'kg' | 'mt' | 'oz' | 'lb' | 't'

    export interface Measure {
        system: string
        unit: any
    }

    export interface Unit {
        abbr: string
        measure: string
        system: string
        unit: Measure
    }

    export const volume: Measure
    export const mass: Measure

    export default function configureMeasurements(measures: { volume?: any, mass?: any }): (value: number) => {
        from: (unit: string) => {
            to: (unit: string) => number
            toBest: (options?: { exclude?: string[], cutOffNumber?: number }) => { val: number, unit: string, singular: string, plural: string }
        }
    }
}
