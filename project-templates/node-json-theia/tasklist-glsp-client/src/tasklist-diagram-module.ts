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
    initializeDiagramContainer,
    LogLevel,
    overrideModelElement,
    TYPES
} from '@eclipse-glsp/client';
import 'balloon-css/balloon.min.css';
import { Container, ContainerModule } from 'inversify';
import '../css/diagram.css';
import { TasklistEdgeView } from './tasklist-edge-views';
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

    // Configure different node types
    configureModelElement(context, TaskListTypes.TASK_NODE, GNode, TaskNodeView);
    configureModelElement(context, TaskListTypes.DECISION_NODE, GNode, DecisionNodeView);
    configureModelElement(context, TaskListTypes.START_NODE, GNode, StartNodeView);
    configureModelElement(context, TaskListTypes.END_NODE, GNode, EndNodeView);
    configureModelElement(context, TaskListTypes.API_NODE, GNode, ApiNodeView);
    configureModelElement(context, TaskListTypes.DECISION_TABLE_NODE, GNode, DecisionTableNodeView);
    configureModelElement(context, TaskListTypes.AUTO_NODE, GNode, AutoNodeView);
    configureModelElement(context, TaskListTypes.SUB_PROCESS_NODE, GNode, SubProcessNodeView);

    // Configure edge type with Manhattan routing support
    configureModelElement(context, TaskListTypes.TRANSITION_EDGE, GEdge, TasklistEdgeView);
});

export function initializeTasklistDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
    return initializeDiagramContainer(container, taskListDiagramModule, TasklistRouterModule, ...containerConfiguration);
}
