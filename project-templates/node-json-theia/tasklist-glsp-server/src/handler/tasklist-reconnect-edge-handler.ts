/********************************************************************************
 * Copyright (c) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied:
 * -- GNU General Public License, version 2 with the GNU Classpath Exception
 * which is available at https://www.gnu.org/software/classpath/license.html
 * -- MIT License which is available at https://opensource.org/license/mit.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0 OR MIT
 ********************************************************************************/

import { Command, GEdge, JsonOperationHandler, MaybePromise, ReconnectEdgeOperation } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { TaskListModelState } from '../model/tasklist-model-state';

@injectable()
export class TaskListReconnectEdgeHandler extends JsonOperationHandler {
    readonly operationType = ReconnectEdgeOperation.KIND;

    @inject(TaskListModelState)
    protected override modelState: TaskListModelState;

    override createCommand(operation: ReconnectEdgeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => this.executeReconnect(operation));
    }

    protected executeReconnect(operation: ReconnectEdgeOperation): void {
        const index = this.modelState.index;
        const edge = index.findByClass(operation.edgeElementId, GEdge);

        if (!edge) {
            return;
        }

        const transition = index.findTransition(edge.id);
        if (!transition) {
            return;
        }

        // Update source if provided
        if (operation.sourceElementId) {
            transition.sourceTaskId = operation.sourceElementId;
        }

        // Update target if provided
        if (operation.targetElementId) {
            transition.targetTaskId = operation.targetElementId;
        }
    }
}
