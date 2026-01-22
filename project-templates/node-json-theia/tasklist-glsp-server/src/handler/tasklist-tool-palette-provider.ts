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
import { PaletteItem, TriggerEdgeCreationAction, TriggerNodeCreationAction } from '@eclipse-glsp/protocol';
import { ToolPaletteItemProvider } from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { TaskListTypes } from '../model/tasklist-types';

@injectable()
export class TaskListToolPaletteProvider extends ToolPaletteItemProvider {
    getItems(): PaletteItem[] {
        return [
            {
                id: 'tasklist-nodes',
                label: '节点',
                sortString: 'A',
                actions: [],
                children: [
                    {
                        id: TaskListTypes.START_NODE,
                        label: '开始',
                        sortString: 'A',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.START_NODE)]
                    },
                    {
                        id: TaskListTypes.END_NODE,
                        label: '结束',
                        sortString: 'B',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.END_NODE)]
                    },
                    {
                        id: TaskListTypes.END_NODE,
                        label: '异常',
                        sortString: 'C',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.END_NODE, { args: { type: 'error-end' } })]
                    },
                    {
                        id: TaskListTypes.TASK_NODE,
                        label: '流程',
                        sortString: 'D',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.TASK_NODE)]
                    },
                    {
                        id: TaskListTypes.DECISION_NODE,
                        label: '分支',
                        sortString: 'E',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.DECISION_NODE)]
                    },

                    {
                        id: TaskListTypes.DECISION_TABLE_NODE,
                        label: '决策表',
                        sortString: 'F',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.DECISION_TABLE_NODE)]
                    },

                    {
                        id: TaskListTypes.SUB_PROCESS_NODE,
                        label: '子流程',
                        sortString: 'G',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.SUB_PROCESS_NODE)]
                    },
                    {
                        id: TaskListTypes.API_NODE,
                        label: 'API',
                        sortString: 'H',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.API_NODE)]
                    },
                    {
                        id: TaskListTypes.AUTO_NODE,
                        label: '自动化',
                        sortString: 'I',
                        actions: [TriggerNodeCreationAction.create(TaskListTypes.AUTO_NODE)]
                    }
                ]
            },
            {
                id: 'tasklist-edges',
                label: '边',
                sortString: 'B',
                actions: [],
                children: [
                    {
                        id: TaskListTypes.TRANSITION_EDGE,
                        label: '连线',
                        sortString: 'A',
                        actions: [TriggerEdgeCreationAction.create(TaskListTypes.TRANSITION_EDGE)]
                    }
                ]
            }
        ];
    }
}
