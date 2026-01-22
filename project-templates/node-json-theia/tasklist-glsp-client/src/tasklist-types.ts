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

export namespace TaskListTypes {
    export const TASK_NODE = 'task:node';
    export const DECISION_NODE = 'decision:node';
    export const START_NODE = 'start:node';
    export const END_NODE = 'end:node';
    export const API_NODE = 'api:node';
    export const DECISION_TABLE_NODE = 'decisionTable:node';
    export const AUTO_NODE = 'auto:node';
    export const SUB_PROCESS_NODE = 'subProcess:node';
    export const TRANSITION_EDGE = 'transition:edge';

    // Port types
    export const RECTANGULAR_PORT = 'rectangular:port';
    export const HEXAGON_PORT = 'hexagon:port';
    export const CIRCLE_PORT = 'circle:port';
    export const DIAMOND_PORT = 'diamond:port';
    export const OCTAGON_PORT = 'octagon:port';
}
