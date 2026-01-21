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
import { GEdge, GGraph, GLabel, GModelFactory, GNode } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { Task, TaskType, Transition } from './tasklist-model';
import { TaskListModelState } from './tasklist-model-state';
import { TaskListTypes } from './tasklist-types';

@injectable()
export class TaskListGModelFactory implements GModelFactory {
    @inject(TaskListModelState)
    protected modelState: TaskListModelState;

    createModel(): void {
        const taskList = this.modelState.sourceModel;
        this.modelState.index.indexTaskList(taskList);
        const childNodes = taskList.tasks.map(task => this.createTaskNode(task));
        const childEdges = taskList.transitions.map(transition => this.createTransitionEdge(transition));
        const newRoot = GGraph.builder() //
            .id(taskList.id)
            .addChildren(childNodes)
            .addChildren(childEdges)
            .build();
        this.modelState.updateRoot(newRoot);
    }

    protected createTaskNode(task: Task): GNode {
        const nodeType = this.getNodeType(task.type);
        const cssClass = this.getNodeCssClass(task.type);

        const size = task.size || Task.getDefaultSize(task.type);

        const builder = GNode.builder()
            .id(task.id)
            .type(nodeType)
            .addCssClass(cssClass)
            .add(GLabel.builder().text(task.name).id(`${task.id}_label`).build())
            .layout('hbox')
            .addLayoutOption('paddingLeft', 5)
            .position(task.position)
            .size(size.width, size.height); // 明确设置节点大小

        return builder.build();
    }

    protected getNodeType(taskType: TaskType): string {
        switch (taskType) {
            case TaskType.TASK:
                return TaskListTypes.TASK_NODE;
            case TaskType.DECISION:
                return TaskListTypes.DECISION_NODE;
            case TaskType.START:
                return TaskListTypes.START_NODE;
            case TaskType.END:
                return TaskListTypes.END_NODE;
            case TaskType.API:
                return TaskListTypes.API_NODE;
            case TaskType.DECISION_TABLE:
                return TaskListTypes.DECISION_TABLE_NODE;
            case TaskType.AUTO:
                return TaskListTypes.AUTO_NODE;
            case TaskType.SUB_PROCESS:
                return TaskListTypes.SUB_PROCESS_NODE;
            default:
                return TaskListTypes.TASK_NODE;
        }
    }

    protected getNodeCssClass(taskType: TaskType): string {
        switch (taskType) {
            case TaskType.TASK:
                return 'tasklist-task';
            case TaskType.DECISION:
                return 'tasklist-decision';
            case TaskType.START:
                return 'tasklist-start';
            case TaskType.END:
                return 'tasklist-end';
            case TaskType.API:
                return 'tasklist-api';
            case TaskType.DECISION_TABLE:
                return 'tasklist-decision-table';
            case TaskType.AUTO:
                return 'tasklist-auto';
            case TaskType.SUB_PROCESS:
                return 'tasklist-subprocess';
            default:
                return 'tasklist-task';
        }
    }

    protected createTransitionEdge(transition: Transition): GEdge {
        const builder = GEdge.builder() //
            .id(transition.id)
            .type(TaskListTypes.TRANSITION_EDGE)
            .addCssClass('tasklist-transition')
            .sourceId(transition.sourceTaskId)
            .targetId(transition.targetTaskId)
            .routerKind('manhattan'); // 使用曼哈顿路由

        // 如果有保存的路由点，则添加它们
        if (transition.routingPoints && transition.routingPoints.length > 0) {
            transition.routingPoints.forEach(point => {
                builder.addRoutingPoint(point);
            });
        }

        return builder.build();
    }
}
