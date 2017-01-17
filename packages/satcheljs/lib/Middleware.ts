import ActionContext from './ActionContext';
import DispatchFunction from './DispatchFunction';
import ActionFunction from './ActionFunction';

interface Middleware {
    (next: DispatchFunction, action: ActionFunction, actionType: string, args: IArguments, actionContext: ActionContext): void | Promise<void>;
}

export default Middleware;
