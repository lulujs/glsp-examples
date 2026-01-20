/********************************************************************************
 * Copyright (c) 2022-2023 EclipseSource and others.
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
import { Command, CreateNodeOperation, GNode, JsonCreateNodeOperationHandler, MaybePromise, Point } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Task, TaskType } from '../model/tasklist-model';
import { TaskListModelState } from '../model/tasklist-model-state';
import { TaskListTypes } from '../model/tasklist-types';

@injectable()
export class CreateTaskHandler extends JsonCreateNodeOperationHandler {
    readonly elementTypeIds = [
        TaskListTypes.TASK_NODE,
        TaskListTypes.DECISION_NODE,
        TaskListTypes.START_NODE,
        TaskListTypes.END_NODE,
        TaskListTypes.API_NODE,
        TaskListTypes.DECISION_TABLE_NODE,
        TaskListTypes.AUTO_NODE,
        TaskListTypes.SUB_PROCESS_NODE
    ];

    @inject(TaskListModelState)
    protected override modelState: TaskListModelState;

    override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const relativeLocation = this.getRelativeLocation(operation) ?? Point.ORIGIN;
            const task = this.createTask(operation.elementTypeId, relativeLocation);
            const taskList = this.modelState.sourceModel;
            taskList.tasks.push(task);
        });
    }

    protected createTask(elementTypeId: string, position: Point): Task {
        const nodeCounter = this.modelState.index.getAllByClass(GNode).length;
        const taskType = this.getTaskType(elementTypeId);
        const defaultName = this.getDefaultName(taskType, nodeCounter);

        return {
            id: uuid.v4(),
            name: defaultName,
            type: taskType,
            position,
            size: Task.getDefaultSize(taskType)
        };
    }

    protected getTaskType(elementTypeId: string): TaskType {
        switch (elementTypeId) {
            case TaskListTypes.TASK_NODE:
                return TaskType.TASK;
            case TaskListTypes.DECISION_NODE:
                return TaskType.DECISION;
            case TaskListTypes.START_NODE:
                return TaskType.START;
            case TaskListTypes.END_NODE:
                return TaskType.END;
            case TaskListTypes.API_NODE:
                return TaskType.API;
            case TaskListTypes.DECISION_TABLE_NODE:
                return TaskType.DECISION_TABLE;
            case TaskListTypes.AUTO_NODE:
                return TaskType.AUTO;
            case TaskListTypes.SUB_PROCESS_NODE:
                return TaskType.SUB_PROCESS;
            default:
                return TaskType.TASK;
        }
    }

    protected getDefaultName(taskType: TaskType, counter: number): string {
        switch (taskType) {
            case TaskType.TASK:
                return `Task${counter}`;
            case TaskType.DECISION:
                return `Decision${counter}`;
            case TaskType.START:
                return `Start${counter}`;
            case TaskType.END:
                return `End${counter}`;
            case TaskType.API:
                return `API${counter}`;
            case TaskType.DECISION_TABLE:
                return `DecisionTable${counter}`;
            case TaskType.AUTO:
                return `Auto${counter}`;
            case TaskType.SUB_PROCESS:
                return `SubProcess${counter}`;
            default:
                return `Node${counter}`;
        }
    }

    get label(): string {
        return 'Node';
    }
}
