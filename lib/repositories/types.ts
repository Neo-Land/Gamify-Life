import type {Command, CompletionResult,State} from '../domain';
// All writes are domain commands. The adapters never accept a client-authored ledger.
export interface ProgressRepository {
 readonly mode:'demo'|'cloud';
 read():Promise<State>;
 mutate(command:Command):Promise<CompletionResult>;
 exportData():Promise<string>;
 reset():Promise<State>;
}
