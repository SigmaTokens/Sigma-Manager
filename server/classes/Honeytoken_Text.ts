import { HoneytokenType } from '../interfaces/type'
import { Honeytoken } from './Honeytoken'

export class Honeytoken_Text extends Honeytoken {
  file_name: string
  location: string

  constructor(
    token_id: string,
    group_id: string,
    type: HoneytokenType,
    expirationDate: Date,
    grade: number,
    notes: string,
    location: string,
    file_name: string,
  ) {
    super(token_id, group_id, type, expirationDate, grade, notes)
    this.location = location
    this.file_name = file_name
  }

  startAgent(): void {}

  createFile(data: string): void {
    //TODO: create the file in this.location
  }

  getFileName(): string {
    return this.file_name
  }
  getLocation(): string {
    return this.location
  }
}
