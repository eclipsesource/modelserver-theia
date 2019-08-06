/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { inject, injectable, optional } from "inversify";

import {
    DEFAULT_LAUNCH_OPTIONS,
    LaunchOptions,
    ModelServerClient,
    Response,
    ServerConfiguration
} from "../common/model-server-client";
import { ModelServerPaths } from "../common/model-server-paths";
import { RestClient } from "./rest-client";

@injectable()
export class DefaultModelServerClient implements ModelServerClient {
    @inject(LaunchOptions) @optional() protected readonly options: LaunchOptions = DEFAULT_LAUNCH_OPTIONS;
    private restClient: RestClient;

    initialize(): Promise<boolean> {
        this.restClient = new RestClient(`http://${this.options.hostname}:${this.options.serverPort}/${this.options.baseURL}`);
        return Promise.resolve(true);
    }

    get(modelUri: string): Promise<Response<string>> {
        return this.restClient.get<{ data: string }>(`${ModelServerPaths.MODEL_CRUD}?modeluri=${modelUri}`)
            .then(r => r.mapBody(b => b.data));
    }

    getAll(): Promise<Response<string[] | string>> {
        return this.restClient.get<{ data: string }>(ModelServerPaths.MODEL_CRUD)
            .then(r => r.mapBody(b => b.data));
    }
    delete(modelUri: string): Promise<Response<boolean>> {
        return this.restClient.remove<{ type: string }>(`${ModelServerPaths.MODEL_CRUD}?modeluri=${modelUri}`)
            .then(r => r.mapBody(b => b.type === "confirm"));
    }
    update(modelUri: string, newModel: any): Promise<Response<string>> {
        return this.restClient.patch<{ data: string }>(`${ModelServerPaths.MODEL_CRUD}?modeluri=${modelUri}`)
            .then(r => r.mapBody(b => b.data));
    }

    getSchema(modelUri: string): Promise<Response<string>> {
        return this.restClient.get<{ data: string }>(`${ModelServerPaths.SCHEMA}?modeluri=${modelUri}`)
            .then(r => r.mapBody(b => b.data));
    }

    configure(configuration: ServerConfiguration): Promise<Response<boolean>> {
        return this.restClient.put<{ type: string }>(ModelServerPaths.SERVER_CONFIGURE, configuration)
            .then(r => r.mapBody(b => b.type === "success"));
    }

    ping(): Promise<Response<boolean>> {
        return this.restClient.get<{ type: string }>(ModelServerPaths.SERVER_PING)
            .then(r => r.mapBody(b => b.type === "success"));
    }
}
