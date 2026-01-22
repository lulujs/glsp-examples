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
import { GEdge, GGraph, GLabel, GModelFactory, GNode, GPort } from '@eclipse-glsp/server';
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
        const baseCssClass = this.getNodeCssClass(task.type);

        const size = task.size || Task.getDefaultSize(task.type);

        const builder = GNode.builder()
            .id(task.id)
            .type(nodeType)
            .addCssClass(baseCssClass)
            .add(GLabel.builder().text(task.name).id(`${task.id}_label`).build())
            .layout('hbox')
            .addLayoutOption('paddingLeft', 5)
            .position(task.position)
            .size(size.width, size.height); // 明确设置节点大小

        // 如果是 error-end 类型，添加额外的样式类
        if (task.subType === 'error-end') {
            builder.addCssClass('error-end');
        }

        // 为每个节点添加相应的ports
        const ports = this.createPortsForNode(task, size);
        ports.forEach(port => builder.add(port));

        return builder.build();
    }

    /**
     * 为不同类型的节点创建相应的ports
     */
    protected createPortsForNode(task: Task, size: { width: number; height: number }): GPort[] {
        const ports: GPort[] = [];
        const centerX = size.width / 2;
        const centerY = size.height / 2;

        switch (task.type) {
            case TaskType.TASK:
            case TaskType.START:
            case TaskType.END:
                // 矩形节点：上下左右4个ports
                ports.push(
                    this.createPort(task.id, '_top', centerX, 0, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_right', size.width, centerY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_left', 0, centerY, TaskListTypes.RECTANGULAR_PORT)
                );
                break;

            case TaskType.DECISION:
                // 菱形节点：上下左右4个ports
                ports.push(
                    this.createPort(task.id, '_top', centerX, 0, TaskListTypes.DIAMOND_PORT),
                    this.createPort(task.id, '_right', size.width, centerY, TaskListTypes.DIAMOND_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height, TaskListTypes.DIAMOND_PORT),
                    this.createPort(task.id, '_left', 0, centerY, TaskListTypes.DIAMOND_PORT)
                );
                break;

            case TaskType.API:
            case TaskType.SUB_PROCESS:
                // 六边形节点：简化为4个主要方向的ports
                ports.push(
                    this.createPort(task.id, '_top', centerX, 5, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_right', size.width - 5, centerY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height - 5, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_left', 5, centerY, TaskListTypes.HEXAGON_PORT)
                );
                break;

            case TaskType.AUTO:
                // 圆形节点：4个主要方向的ports
                ports.push(
                    this.createPort(task.id, '_top', centerX, 5, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_right', size.width - 5, centerY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height - 5, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_left', 5, centerY, TaskListTypes.CIRCLE_PORT)
                );
                break;

            case TaskType.DECISION_TABLE:
                // 八边形节点：4个主要方向的ports
                ports.push(
                    this.createPort(task.id, '_top', centerX, 5, TaskListTypes.OCTAGON_PORT),
                    this.createPort(task.id, '_right', size.width - 5, centerY, TaskListTypes.OCTAGON_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height - 5, TaskListTypes.OCTAGON_PORT),
                    this.createPort(task.id, '_left', 5, centerY, TaskListTypes.OCTAGON_PORT)
                );
                break;
        }

        return ports;
    }

    /**
     * 创建单个port
     */
    protected createPort(nodeId: string, suffix: string, x: number, y: number, portType: string): GPort {
        return GPort.builder()
            .id(`${nodeId}${suffix}`)
            .type(portType)
            .position(x - 5, y - 5) // 10x10的port，居中定位
            .size(10, 10) // 增大port尺寸，更容易点击
            .build();
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
