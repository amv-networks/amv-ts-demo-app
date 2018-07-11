export class ApplicationSettings {
  constructor(
    public baseUrl: string,
    public username: string,
    public password: string,
    public contractId: number,
    public debugMode: boolean) {
  }
}
