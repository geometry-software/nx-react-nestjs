export interface Codec<TDomain, TStored = unknown> {
  encode(value: TDomain): TStored;
  decode(value: TStored): TDomain;
}
