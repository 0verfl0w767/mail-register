import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('mail_users')
export class User {
  @PrimaryColumn({ length: 64 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'tinyint', default: 1 })
  active: boolean;

  @Column({ type: 'tinyint', default: 0 })
  admin: boolean;
}
