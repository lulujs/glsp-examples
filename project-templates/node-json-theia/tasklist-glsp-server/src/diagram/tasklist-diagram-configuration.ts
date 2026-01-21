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
import {
    DiagramConfiguration,
    EdgeTypeHint,
    getDefaultMapping,
    GModelElement,
    GModelElementConstructor,
    ServerLayoutKind,
    ShapeTypeHint
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { TaskListTypes } from '../model/tasklist-types';

@injectable()
export class TaskListDiagramConfiguration implements DiagramConfiguration {
    layoutKind = ServerLayoutKind.MANUAL;
    needsClientLayout = true;
    animatedUpdate = true;

    get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
        return getDefaultMapping();
    }

    get shapeTypeHints(): ShapeTypeHint[] {
        return [
            {
                elementTypeId: TaskListTypes.TASK_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.DECISION_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.START_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.END_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.API_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.DECISION_TABLE_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.AUTO_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            },
            {
                elementTypeId: TaskListTypes.SUB_PROCESS_NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: false
            }
        ];
    }

    get edgeTypeHints(): EdgeTypeHint[] {
        return [
            {
                elementTypeId: TaskListTypes.TRANSITION_EDGE,
                deletable: true,
                repositionable: true, // 允许移动边的端点
                routable: true, // 允许编辑路由点和重新连接
                sourceElementTypeIds: [
                    TaskListTypes.TASK_NODE,
                    TaskListTypes.DECISION_NODE,
                    TaskListTypes.START_NODE,
                    TaskListTypes.API_NODE,
                    TaskListTypes.DECISION_TABLE_NODE,
                    TaskListTypes.AUTO_NODE,
                    TaskListTypes.SUB_PROCESS_NODE
                ],
                targetElementTypeIds: [
                    TaskListTypes.TASK_NODE,
                    TaskListTypes.DECISION_NODE,
                    TaskListTypes.END_NODE,
                    TaskListTypes.API_NODE,
                    TaskListTypes.DECISION_TABLE_NODE,
                    TaskListTypes.AUTO_NODE,
                    TaskListTypes.SUB_PROCESS_NODE
                ]
            }
        ];
    }
}
