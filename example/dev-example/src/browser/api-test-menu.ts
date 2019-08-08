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
import { ModelServerSubscriptionService } from "@modelserver/theia/lib/browser";
import { ModelServerClient, ModelServerCommand, Response } from "@modelserver/theia/lib/common";
import {
  Command,
  CommandContribution,
  CommandRegistry,
  MAIN_MENU_BAR,
  MenuContribution,
  MenuModelRegistry,
  MessageService
} from "@theia/core";
import { inject, injectable } from "inversify";

export const PingCommand: Command = {
  id: 'ApiTest.Ping',
  label: 'ping()'
};

export const GetModelCommand: Command = {
  id: 'ApiTest.GetModel',
  label: 'getModel(superbrewer3000.coffee)'
};

export const GetAllCommand: Command = {
  id: 'ApiTest.GetAll',
  label: 'getAll()'
};
export const PatchCommand: Command = {
  id: 'ApiTest.Patch',
  label: 'patch(superbrewer3000.coffee)'
};
export const SubscribeCommand: Command = {
  id: 'ApiTest.Subscribe',
  label: 'subscribe(superbrewer3000.coffee)'
};
export const UnsubscribeCommand: Command = {
  id: 'ApiTest.Unsubscribe',
  label: 'unsubscribe(superbrewer3000.coffee)'
};
export const EditSetCommand: Command = {
  id: 'ApiTest.EditSet',
  label: 'edit(superbrewer3000.coffee,{type:set})'
};

export const API_TEST_MENU = [...MAIN_MENU_BAR, '9_API_TEST_MENU'];
export const PING = [...API_TEST_MENU, PingCommand.label];
export const GET_MODEL = [...API_TEST_MENU, GetModelCommand.label];
export const GET_ALL = [...API_TEST_MENU, GetAllCommand.label];
export const PATCH = [...API_TEST_MENU, PatchCommand.label];
export const SUBSCRIBE = [...API_TEST_MENU, SubscribeCommand.label];
export const UNSUBSCRIBE = [...API_TEST_MENU, UnsubscribeCommand.label];
export const EDIT_SET = [...API_TEST_MENU, EditSetCommand.label];

const exampleFilePatch = {
  'eClass':
    'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Machine',
  'children': [
    {
      'eClass':
        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//BrewingUnit'
    },
    {
      'eClass':
        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//ControlUnit',
      'processor': {
        'clockSpeed': 50,
        'numberOfCores': 20,
        'socketconnectorType': 'Z51',
        'thermalDesignPower': 200
      },
      'display': {
        'width': 50,
        'height': 50
      }
    }
  ],
  'name': 'Super Brewer 5000',
  'workflows': [
    {
      'nodes': [
        {
          'eClass':
            'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask',
          'name': 'PreHeat',
          'component': {
            'eClass':
              'http://www.eclipsesource.com/modelserver/example/coffeemodel#//BrewingUnit',
            '$ref': '//@children.0'
          }
        }
      ]
    }
  ]
};

@injectable()
export class ApiTestMenuContribution
  implements MenuContribution, CommandContribution {
  @inject(MessageService) protected readonly messageService: MessageService;
  @inject(ModelServerClient)
  protected readonly modelServerClient: ModelServerClient;
  @inject(ModelServerSubscriptionService)
  protected readonly modelServerSubscriptionService: ModelServerSubscriptionService;

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(PingCommand, {
      execute: () => {
        this.modelServerClient
          .ping()
          .then(response => this.messageService.info(printResponse(response)));
      }
    });
    commands.registerCommand(GetModelCommand, {
      execute: () => {
        this.modelServerClient
          .get('SuperBrewer3000.coffee')
          .then(response => this.messageService.info(printResponse(response)));
      }
    });

    commands.registerCommand(GetAllCommand, {
      execute: () => {
        this.modelServerClient
          .getAll()
          .then(response => this.messageService.info(printResponse(response)));
      }
    });
    commands.registerCommand(PatchCommand, {
      execute: () => {
        this.modelServerClient
          .update('superbrewer3000.coffee', exampleFilePatch)
          .then(response => this.messageService.info(printResponse(response)));
      }
    });
    commands.registerCommand(SubscribeCommand, {
      execute: () => {
        this.modelServerSubscriptionService.onOpenListener(() =>
          this.messageService.info('Subscription opened!')
        );
        this.modelServerSubscriptionService.onMessageListener(response => {
          if (typeof response === 'string') {
            this.messageService.info(response);
          } else {
            this.messageService.info(JSON.stringify(response));
          }
        });
        this.modelServerSubscriptionService.onClosedListener(reason =>
          this.messageService.info(`Closed!
        Reason: ${reason}`)
        );
        this.modelServerSubscriptionService.onErrorListener(error =>
          this.messageService.error(JSON.stringify(error))
        );
        this.modelServerClient.subscribe('superbrewer3000.coffee');
      }
    });
    commands.registerCommand(UnsubscribeCommand, {
      execute: () => {
        this.modelServerClient.unsubscribe('superbrewer3000.coffee');
      }
    });
    commands.registerCommand(EditSetCommand, {
      execute: () => {
        const setCommand: ModelServerCommand = {
          'eClass':
            'http://www.eclipsesource.com/schema/2019/modelserver/command#//Command',
          'type': 'set',
          'owner': {
            'eClass':
              'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask',
            '$ref':
              'file:/home/eugen/Git/modelserver/examples/com.eclipsesource.modelserver.example/.temp/workspace/superbrewer3000.coffee#//@workflows.0'
          },
          'feature': 'name',
          'dataValues': ['Auto Brew'],
          'indices': [-1]
        };
        this.modelServerClient.edit('superbrewer3000.coffee', setCommand);
      }
    });
  }
  registerMenus(menus: MenuModelRegistry): void {
    menus.registerSubmenu(API_TEST_MENU, 'ModelServer');
    menus.registerMenuAction(API_TEST_MENU, { commandId: PingCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: GetModelCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: GetAllCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: PatchCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: SubscribeCommand.id });
    menus.registerMenuAction(API_TEST_MENU, {
      commandId: UnsubscribeCommand.id
    });
    menus.registerMenuAction(API_TEST_MENU, { commandId: EditSetCommand.id });
  }
}

function printResponse(response: Response<any>) {
  return `StatusCode: ${response.statusCode}
            StatusMessage: ${response.statusMessage}
            Body: ${
    response.body ? JSON.stringify(response.body) : 'undefined'
    }`;
}
