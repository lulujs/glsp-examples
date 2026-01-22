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
import {
    configureDefaultModelElements,
    configureModelElement,
    ConsoleLogger,
    ContainerConfiguration,
    DefaultTypes,
    editLabelFeature,
    GEdge,
    GGraph,
    GLabel,
    GLabelView,
    GNode,
    GPort,
    initializeDiagramContainer,
    LogLevel,
    overrideModelElement,
    selectFeature,
    TYPES
} from '@eclipse-glsp/client';
import 'balloon-css/balloon.min.css';
import { Container, ContainerModule } from 'inversify';
import '../css/diagram.css';
import '../css/ports.css';
import { TasklistEdgeView } from './tasklist-edge-views';
import { CirclePortView, DiamondPortView, HexagonPortView, OctagonPortView, RectangularPortView } from './tasklist-port-views';
import { TasklistRouterModule } from './tasklist-router-module';
import { TaskListTypes } from './tasklist-types';
import {
    ApiNodeView,
    AutoNodeView,
    DecisionNodeView,
    DecisionTableNodeView,
    EndNodeView,
    StartNodeView,
    SubProcessNodeView,
    TaskNodeView,
    WorkflowGraphView
} from './tasklist-views';

const taskListDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    const context = { bind, unbind, isBound, rebind };
    configureDefaultModelElements(context);

    // 覆盖图形视图
    overrideModelElement(context, DefaultTypes.GRAPH, GGraph, WorkflowGraphView);

    configureModelElement(context, DefaultTypes.LABEL, GLabel, GLabelView, { enable: [editLabelFeature] });

    // Configure different node types - 使用统一的GNode（暂时保持简单）
    configureModelElement(context, TaskListTypes.TASK_NODE, GNode, TaskNodeView);
    configureModelElement(context, TaskListTypes.DECISION_NODE, GNode, DecisionNodeView);
    configureModelElement(context, TaskListTypes.START_NODE, GNode, StartNodeView);
    configureModelElement(context, TaskListTypes.END_NODE, GNode, EndNodeView);
    configureModelElement(context, TaskListTypes.API_NODE, GNode, ApiNodeView);
    configureModelElement(context, TaskListTypes.DECISION_TABLE_NODE, GNode, DecisionTableNodeView);
    configureModelElement(context, TaskListTypes.AUTO_NODE, GNode, AutoNodeView);
    configureModelElement(context, TaskListTypes.SUB_PROCESS_NODE, GNode, SubProcessNodeView);

    // Configure port types - 禁用selectFeature以避免阻止节点移动
    configureModelElement(context, TaskListTypes.RECTANGULAR_PORT, GPort, RectangularPortView, { disable: [selectFeature] });
    configureModelElement(context, TaskListTypes.HEXAGON_PORT, GPort, HexagonPortView, { disable: [selectFeature] });
    configureModelElement(context, TaskListTypes.CIRCLE_PORT, GPort, CirclePortView, { disable: [selectFeature] });
    configureModelElement(context, TaskListTypes.DIAMOND_PORT, GPort, DiamondPortView, { disable: [selectFeature] });
    configureModelElement(context, TaskListTypes.OCTAGON_PORT, GPort, OctagonPortView, { disable: [selectFeature] });

    // Configure edge type
    configureModelElement(context, TaskListTypes.TRANSITION_EDGE, GEdge, TasklistEdgeView);
});

export function initializeTasklistDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
    return initializeDiagramContainer(container, taskListDiagramModule, TasklistRouterModule, ...containerConfiguration);
}
