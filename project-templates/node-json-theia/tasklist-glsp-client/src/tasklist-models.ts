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

import { GNode } from '@eclipse-glsp/client';

// Anchor kind constants (without router prefix)
export const HEXAGON_ANCHOR_KIND = 'hexagon';
export const CIRCLE_ANCHOR_KIND = 'circle';

/**
 * Custom node class for hexagonal nodes (API and SubProcess)
 */
export class HexagonNode extends GNode {
    override get anchorKind(): string {
        return HEXAGON_ANCHOR_KIND;
    }
}

/**
 * Custom node class for circular nodes (Auto)
 */
export class CircleNode extends GNode {
    override get anchorKind(): string {
        return CIRCLE_ANCHOR_KIND;
    }
}
