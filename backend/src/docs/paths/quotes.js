/**
 * @swagger
 * /quotes/request:
 *   post:
 *     summary: Solicitar cotação
 *     description: Cria uma nova solicitação de cotação para um produto
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do produto para cotação
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantidade desejada
 *                 example: 10
 *               message:
 *                 type: string
 *                 description: Mensagem adicional para o fornecedor
 *                 example: Preciso desta quantidade para projeto urgente
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: Rua das Indústrias, 500
 *                   city:
 *                     type: string
 *                     example: São Paulo
 *                   state:
 *                     type: string
 *                     example: SP
 *                   zipCode:
 *                     type: string
 *                     example: 01234-567
 *               expectedDelivery:
 *                 type: string
 *                 format: date
 *                 description: Data esperada de entrega
 *                 example: 2024-02-15
 *     responses:
 *       201:
 *         description: Cotação solicitada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cotação solicitada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Produto não encontrado
 *               code: PRODUCT_NOT_FOUND
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /quotes/buyer:
 *   get:
 *     summary: Listar cotações do comprador
 *     description: Retorna todas as cotações feitas pelo comprador autenticado
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, quoted, accepted, rejected, expired]
 *         description: Filtrar por status da cotação
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de cotações do comprador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     quotes:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Quote'
 *                           - type: object
 *                             properties:
 *                               Product:
 *                                 $ref: '#/components/schemas/Product'
 *                               Supplier:
 *                                 $ref: '#/components/schemas/Supplier'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /quotes/supplier:
 *   get:
 *     summary: Listar cotações do fornecedor
 *     description: Retorna todas as cotações recebidas pelo fornecedor autenticado
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, quoted, accepted, rejected, expired]
 *         description: Filtrar por status da cotação
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de cotações do fornecedor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     quotes:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Quote'
 *                           - type: object
 *                             properties:
 *                               Product:
 *                                 $ref: '#/components/schemas/Product'
 *                               Buyer:
 *                                 $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Usuário não é fornecedor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Acesso restrito a fornecedores
 *               code: SUPPLIER_ONLY
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /quotes/{quoteId}/respond:
 *   put:
 *     summary: Responder cotação
 *     description: Permite que o fornecedor responda uma cotação com preço e condições
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da cotação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitPrice
 *             properties:
 *               unitPrice:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: Preço unitário proposto
 *                 example: 420.00
 *               deliveryTime:
 *                 type: integer
 *                 minimum: 1
 *                 description: Prazo de entrega em dias
 *                 example: 15
 *               observations:
 *                 type: string
 *                 description: Observações sobre a cotação
 *                 example: Preço válido por 30 dias. Frete não incluso.
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 description: Data limite para aceitar a cotação
 *               shippingCost:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: Custo de frete
 *                 example: 50.00
 *     responses:
 *       200:
 *         description: Cotação respondida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cotação respondida com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Sem permissão para responder esta cotação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Você não pode responder esta cotação
 *               code: QUOTE_ACCESS_DENIED
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /quotes/{quoteId}/accept:
 *   post:
 *     summary: Aceitar cotação
 *     description: Permite que o comprador aceite uma cotação respondida pelo fornecedor
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da cotação
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [pix, credit_card, bank_transfer, boleto]
 *                 description: Método de pagamento preferido
 *                 example: pix
 *               deliveryInstructions:
 *                 type: string
 *                 description: Instruções especiais para entrega
 *                 example: Entregar no período da manhã
 *     responses:
 *       200:
 *         description: Cotação aceita com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cotação aceita com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     quote:
 *                       $ref: '#/components/schemas/Quote'
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Sem permissão para aceitar esta cotação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Você não pode aceitar esta cotação
 *               code: QUOTE_ACCESS_DENIED
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Cotação não pode ser aceita
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Cotação não está disponível para aceitação
 *               code: QUOTE_NOT_AVAILABLE
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /quotes/{quoteId}/reject:
 *   post:
 *     summary: Rejeitar cotação
 *     description: Permite que o comprador rejeite uma cotação
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da cotação
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo da rejeição
 *                 example: Preço acima do orçamento disponível
 *     responses:
 *       200:
 *         description: Cotação rejeitada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Sem permissão para rejeitar esta cotação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */