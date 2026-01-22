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
import { Command, CreateEdgeOperation, GNode, GPort, JsonCreateEdgeOperationHandler, MaybePromise } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Transition } from '../model/tasklist-model';
import { TaskListModelState } from '../model/tasklist-model-state';
import { TaskListTypes } from '../model/tasklist-types';

@injectable()
export class CreateTransitionHandler extends JsonCreateEdgeOperationHandler {
    readonly elementTypeIds = [TaskListTypes.TRANSITION_EDGE];

    @inject(TaskListModelState)
    protected override modelState: TaskListModelState;

    override createCommand(operation: CreateEdgeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const transition: Transition = {
                id: uuid.v4(),
                sourceTaskId: operation.sourceElementId,
                targetTaskId: operation.targetElementId
            };

            // Calculate and save port positions
            const index = this.modelState.index;
            const sourcePort = index.findByClass(operation.sourceElementId, GPort);
            const targetPort = index.findByClass(operation.targetElementId, GPort);

            if (sourcePort) {
                transition.sourcePortPosition = this.getPortAbsolutePosition(sourcePort);
            }

            if (targetPort) {
                transition.targetPortPosition = this.getPortAbsolutePosition(targetPort);
            }

            this.modelState.sourceModel.transitions.push(transition);
        });
    }

    /**
     * 获取port的绝对坐标（相对于画布）
     */
    protected getPortAbsolutePosition(port: GPort): { x: number; y: number } {
        const parent = port.parent as GNode | undefined;
        if (!parent) {
            return { x: port.position.x + port.size.width / 2, y: port.position.y + port.size.height / 2 };
        }

        // Port position is relative to its parent node
        // Add parent's position to get absolute position
        const portCenterX = port.position.x + port.size.width / 2;
        const portCenterY = port.position.y + port.size.height / 2;

        return {
            x: parent.position.x + portCenterX,
            y: parent.position.y + portCenterY
        };
    }

    get label(): string {
        return 'Transition';
    }
}
