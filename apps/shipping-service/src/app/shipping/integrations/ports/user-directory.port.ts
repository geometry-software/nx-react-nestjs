export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export abstract class UserDirectoryPort {
  abstract findUser(id: string): Promise<DirectoryUser>;
}
