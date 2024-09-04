# ComuniInvest Backend
Este repositório contém o código-fonte do backend do projeto ComuniInvest, uma plataforma de micro investimento social. Este backend é responsável por gerenciar a lógica de negócios, autenticação de usuários, persistência de dados, e comunicação com outros microsserviços da aplicação.

## Arquitetura
O backend do ComuniInvest é construído usando uma arquitetura de microsserviços, desenvolvida em Node.js. Cada microsserviço é responsável por um domínio específico da aplicação, garantindo escalabilidade e modularidade.

## Microsserviços Principais
User Service: Gerencia o cadastro e a autenticação de usuários.
Investment Service: Gerencia as operações de investimento e suas transações.
Notification Service: Envia notificações para os usuários via email ou outros canais.
Gateway Service: Age como um ponto de entrada único para a comunicação entre os microsserviços e os clientes.
