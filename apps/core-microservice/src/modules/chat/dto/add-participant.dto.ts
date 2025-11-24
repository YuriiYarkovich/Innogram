export class AddParticipantDto {
  constructor(participantsIds: string[]) {
    this.participantsIds = participantsIds;
  }

  readonly participantsIds: string[];
}
