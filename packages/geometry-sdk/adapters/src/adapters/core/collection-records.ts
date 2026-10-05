/** Reserved record IDs in an adapter-backed source collection. */
export const COLLECTION_METADATA_RECORD_ID = 'metadata';
export const COLLECTION_UPDATE_RECORD_ID = 'update';

export function isCollectionDataRecordId(id: string): boolean {
  return id !== COLLECTION_METADATA_RECORD_ID && id !== COLLECTION_UPDATE_RECORD_ID;
}
