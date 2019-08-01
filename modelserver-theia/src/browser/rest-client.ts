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
const fetch = require("node-fetch");
/**
 * A simple helper class for performing REST requests
 */
export class RestClient {

    constructor(protected baseUrl: string) {
        if (!baseUrl.endsWith("/")) {
            this.baseUrl = baseUrl + "/";
        }
    }

    private async performRequest<T>(verb: string, path: string, body?: any): Promise<Response<T>> {
        const jsonBody: string = JSON.stringify(body);
        const response = await fetch(this.baseUrl + path, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            method: verb,
            body: jsonBody
        });
        const json = await response.json() as T;
        return new Response(json, response.status, response.statusText);

    }


    async get(path: string, parameters?: Map<string, string>): Promise<Response<any>> {
        let getUrl = path;
        if (parameters) {
            const urlParameters = this.encodeURLParameters(parameters);
            getUrl = getUrl.concat(urlParameters);
        }
        return this.performRequest<any>('get', getUrl);
    }

    async post(url: string, body?: any): Promise<Response<any>> {
        return this.performRequest<any>('post', url, body);
    }

    async put(url: string, body?: any): Promise<Response<any>> {
        return this.performRequest<any>('PUT', url, body);
    }

    async patch(url: string, body?: any): Promise<Response<any>> {
        return this.performRequest<any>('patch', url, body);

    }

    async remove(url: string, parameters?: Map<string, string>): Promise<Response<any>> {
        let deleteUrl = url;
        if (parameters) {
            const urlParameters = this.encodeURLParameters(parameters);
            deleteUrl = deleteUrl.concat(urlParameters);
        }
        return this.performRequest<any>('delete', deleteUrl);

    }

    private encodeURLParameters(parameters: Map<string, string>): string {
        if (parameters.size) {
            const urlParameters: string = '?';
            const parametersArray: string[] = [];
            parameters.forEach((value, key) => {
                parametersArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });
            return urlParameters.concat(parametersArray.join('&'));
        }
        return '';
    }
}
export class Response<T> {

    constructor(readonly body: T, readonly statusCode: number, readonly statusMessage: string) { }

    toString() {
        return `StatusCode: ${this.statusCode}
                StatusMessage: ${this.statusMessage}
                Body: ${this.body ? JSON.stringify(this.body) : "undefined"}`;
    }

    public mapBody<U>(mapper: (body: T) => U): Response<U> {
        return new Response(mapper(this.body), this.statusCode, this.statusMessage);
    }
}
