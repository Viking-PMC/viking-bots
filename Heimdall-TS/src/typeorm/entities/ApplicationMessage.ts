import { Column, Entity, ManyToOne, ObjectIdColumn } from 'typeorm';
import { Application } from './Application';

/**
 * Represents a message sent in an Application.
 * @category Entity
 * @public
 * @class
 * @extends {Application}
 * @property {string} id The id of the message.
 * @property {string} content The content of the message.
 * @property {string} author The author of the message.
 * @property {string} authorAvatar The avatar of the author.
 * @property {string} authorId The id of the author.
 * @property {Date} createdAt The date the message was created.
 * @property {Application} application The application the message belongs to.
 */
@Entity({ name: 'application_messages' })
export class ApplicationMessage {
  @ObjectIdColumn()
  id: number;

  @Column({ default: '' })
  content: string;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  authorTag: string;

  @Column({ nullable: true })
  authorId: string;

  @Column({ nullable: true })
  authorAvatar: string;

  @ManyToOne(() => Application, (application) => application.messages)
  application: Application;
}
