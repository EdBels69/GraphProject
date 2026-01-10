
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ResearchJob
 * 
 */
export type ResearchJob = $Result.DefaultSelection<Prisma.$ResearchJobPayload>
/**
 * Model Article
 * 
 */
export type Article = $Result.DefaultSelection<Prisma.$ArticlePayload>
/**
 * Model Graph
 * 
 */
export type Graph = $Result.DefaultSelection<Prisma.$GraphPayload>
/**
 * Model GraphNode
 * 
 */
export type GraphNode = $Result.DefaultSelection<Prisma.$GraphNodePayload>
/**
 * Model GraphEdge
 * 
 */
export type GraphEdge = $Result.DefaultSelection<Prisma.$GraphEdgePayload>
/**
 * Model SystemConfig
 * 
 */
export type SystemConfig = $Result.DefaultSelection<Prisma.$SystemConfigPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ResearchJobs
 * const researchJobs = await prisma.researchJob.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ResearchJobs
   * const researchJobs = await prisma.researchJob.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.researchJob`: Exposes CRUD operations for the **ResearchJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ResearchJobs
    * const researchJobs = await prisma.researchJob.findMany()
    * ```
    */
  get researchJob(): Prisma.ResearchJobDelegate<ExtArgs>;

  /**
   * `prisma.article`: Exposes CRUD operations for the **Article** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Articles
    * const articles = await prisma.article.findMany()
    * ```
    */
  get article(): Prisma.ArticleDelegate<ExtArgs>;

  /**
   * `prisma.graph`: Exposes CRUD operations for the **Graph** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Graphs
    * const graphs = await prisma.graph.findMany()
    * ```
    */
  get graph(): Prisma.GraphDelegate<ExtArgs>;

  /**
   * `prisma.graphNode`: Exposes CRUD operations for the **GraphNode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GraphNodes
    * const graphNodes = await prisma.graphNode.findMany()
    * ```
    */
  get graphNode(): Prisma.GraphNodeDelegate<ExtArgs>;

  /**
   * `prisma.graphEdge`: Exposes CRUD operations for the **GraphEdge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GraphEdges
    * const graphEdges = await prisma.graphEdge.findMany()
    * ```
    */
  get graphEdge(): Prisma.GraphEdgeDelegate<ExtArgs>;

  /**
   * `prisma.systemConfig`: Exposes CRUD operations for the **SystemConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemConfigs
    * const systemConfigs = await prisma.systemConfig.findMany()
    * ```
    */
  get systemConfig(): Prisma.SystemConfigDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ResearchJob: 'ResearchJob',
    Article: 'Article',
    Graph: 'Graph',
    GraphNode: 'GraphNode',
    GraphEdge: 'GraphEdge',
    SystemConfig: 'SystemConfig'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "researchJob" | "article" | "graph" | "graphNode" | "graphEdge" | "systemConfig"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ResearchJob: {
        payload: Prisma.$ResearchJobPayload<ExtArgs>
        fields: Prisma.ResearchJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ResearchJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ResearchJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>
          }
          findFirst: {
            args: Prisma.ResearchJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ResearchJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>
          }
          findMany: {
            args: Prisma.ResearchJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>[]
          }
          create: {
            args: Prisma.ResearchJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>
          }
          createMany: {
            args: Prisma.ResearchJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ResearchJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>[]
          }
          delete: {
            args: Prisma.ResearchJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>
          }
          update: {
            args: Prisma.ResearchJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>
          }
          deleteMany: {
            args: Prisma.ResearchJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ResearchJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ResearchJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchJobPayload>
          }
          aggregate: {
            args: Prisma.ResearchJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResearchJob>
          }
          groupBy: {
            args: Prisma.ResearchJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResearchJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.ResearchJobCountArgs<ExtArgs>
            result: $Utils.Optional<ResearchJobCountAggregateOutputType> | number
          }
        }
      }
      Article: {
        payload: Prisma.$ArticlePayload<ExtArgs>
        fields: Prisma.ArticleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ArticleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ArticleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>
          }
          findFirst: {
            args: Prisma.ArticleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ArticleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>
          }
          findMany: {
            args: Prisma.ArticleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>[]
          }
          create: {
            args: Prisma.ArticleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>
          }
          createMany: {
            args: Prisma.ArticleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ArticleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>[]
          }
          delete: {
            args: Prisma.ArticleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>
          }
          update: {
            args: Prisma.ArticleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>
          }
          deleteMany: {
            args: Prisma.ArticleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ArticleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ArticleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArticlePayload>
          }
          aggregate: {
            args: Prisma.ArticleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateArticle>
          }
          groupBy: {
            args: Prisma.ArticleGroupByArgs<ExtArgs>
            result: $Utils.Optional<ArticleGroupByOutputType>[]
          }
          count: {
            args: Prisma.ArticleCountArgs<ExtArgs>
            result: $Utils.Optional<ArticleCountAggregateOutputType> | number
          }
        }
      }
      Graph: {
        payload: Prisma.$GraphPayload<ExtArgs>
        fields: Prisma.GraphFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GraphFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GraphFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>
          }
          findFirst: {
            args: Prisma.GraphFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GraphFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>
          }
          findMany: {
            args: Prisma.GraphFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>[]
          }
          create: {
            args: Prisma.GraphCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>
          }
          createMany: {
            args: Prisma.GraphCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GraphCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>[]
          }
          delete: {
            args: Prisma.GraphDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>
          }
          update: {
            args: Prisma.GraphUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>
          }
          deleteMany: {
            args: Prisma.GraphDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GraphUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GraphUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphPayload>
          }
          aggregate: {
            args: Prisma.GraphAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGraph>
          }
          groupBy: {
            args: Prisma.GraphGroupByArgs<ExtArgs>
            result: $Utils.Optional<GraphGroupByOutputType>[]
          }
          count: {
            args: Prisma.GraphCountArgs<ExtArgs>
            result: $Utils.Optional<GraphCountAggregateOutputType> | number
          }
        }
      }
      GraphNode: {
        payload: Prisma.$GraphNodePayload<ExtArgs>
        fields: Prisma.GraphNodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GraphNodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GraphNodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>
          }
          findFirst: {
            args: Prisma.GraphNodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GraphNodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>
          }
          findMany: {
            args: Prisma.GraphNodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>[]
          }
          create: {
            args: Prisma.GraphNodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>
          }
          createMany: {
            args: Prisma.GraphNodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GraphNodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>[]
          }
          delete: {
            args: Prisma.GraphNodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>
          }
          update: {
            args: Prisma.GraphNodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>
          }
          deleteMany: {
            args: Prisma.GraphNodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GraphNodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GraphNodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphNodePayload>
          }
          aggregate: {
            args: Prisma.GraphNodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGraphNode>
          }
          groupBy: {
            args: Prisma.GraphNodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<GraphNodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.GraphNodeCountArgs<ExtArgs>
            result: $Utils.Optional<GraphNodeCountAggregateOutputType> | number
          }
        }
      }
      GraphEdge: {
        payload: Prisma.$GraphEdgePayload<ExtArgs>
        fields: Prisma.GraphEdgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GraphEdgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GraphEdgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>
          }
          findFirst: {
            args: Prisma.GraphEdgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GraphEdgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>
          }
          findMany: {
            args: Prisma.GraphEdgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>[]
          }
          create: {
            args: Prisma.GraphEdgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>
          }
          createMany: {
            args: Prisma.GraphEdgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GraphEdgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>[]
          }
          delete: {
            args: Prisma.GraphEdgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>
          }
          update: {
            args: Prisma.GraphEdgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>
          }
          deleteMany: {
            args: Prisma.GraphEdgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GraphEdgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GraphEdgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraphEdgePayload>
          }
          aggregate: {
            args: Prisma.GraphEdgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGraphEdge>
          }
          groupBy: {
            args: Prisma.GraphEdgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<GraphEdgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.GraphEdgeCountArgs<ExtArgs>
            result: $Utils.Optional<GraphEdgeCountAggregateOutputType> | number
          }
        }
      }
      SystemConfig: {
        payload: Prisma.$SystemConfigPayload<ExtArgs>
        fields: Prisma.SystemConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>
          }
          findFirst: {
            args: Prisma.SystemConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>
          }
          findMany: {
            args: Prisma.SystemConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>[]
          }
          create: {
            args: Prisma.SystemConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>
          }
          createMany: {
            args: Prisma.SystemConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>[]
          }
          delete: {
            args: Prisma.SystemConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>
          }
          update: {
            args: Prisma.SystemConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>
          }
          deleteMany: {
            args: Prisma.SystemConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SystemConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemConfigPayload>
          }
          aggregate: {
            args: Prisma.SystemConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemConfig>
          }
          groupBy: {
            args: Prisma.SystemConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemConfigCountArgs<ExtArgs>
            result: $Utils.Optional<SystemConfigCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ResearchJobCountOutputType
   */

  export type ResearchJobCountOutputType = {
    articles: number
  }

  export type ResearchJobCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    articles?: boolean | ResearchJobCountOutputTypeCountArticlesArgs
  }

  // Custom InputTypes
  /**
   * ResearchJobCountOutputType without action
   */
  export type ResearchJobCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJobCountOutputType
     */
    select?: ResearchJobCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ResearchJobCountOutputType without action
   */
  export type ResearchJobCountOutputTypeCountArticlesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ArticleWhereInput
  }


  /**
   * Count Type GraphCountOutputType
   */

  export type GraphCountOutputType = {
    jobs: number
    detailedNodes: number
    detailedEdges: number
  }

  export type GraphCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobs?: boolean | GraphCountOutputTypeCountJobsArgs
    detailedNodes?: boolean | GraphCountOutputTypeCountDetailedNodesArgs
    detailedEdges?: boolean | GraphCountOutputTypeCountDetailedEdgesArgs
  }

  // Custom InputTypes
  /**
   * GraphCountOutputType without action
   */
  export type GraphCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphCountOutputType
     */
    select?: GraphCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GraphCountOutputType without action
   */
  export type GraphCountOutputTypeCountJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResearchJobWhereInput
  }

  /**
   * GraphCountOutputType without action
   */
  export type GraphCountOutputTypeCountDetailedNodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraphNodeWhereInput
  }

  /**
   * GraphCountOutputType without action
   */
  export type GraphCountOutputTypeCountDetailedEdgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraphEdgeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ResearchJob
   */

  export type AggregateResearchJob = {
    _count: ResearchJobCountAggregateOutputType | null
    _avg: ResearchJobAvgAggregateOutputType | null
    _sum: ResearchJobSumAggregateOutputType | null
    _min: ResearchJobMinAggregateOutputType | null
    _max: ResearchJobMaxAggregateOutputType | null
  }

  export type ResearchJobAvgAggregateOutputType = {
    progress: number | null
    articlesFound: number | null
    articlesProcessed: number | null
  }

  export type ResearchJobSumAggregateOutputType = {
    progress: number | null
    articlesFound: number | null
    articlesProcessed: number | null
  }

  export type ResearchJobMinAggregateOutputType = {
    id: string | null
    topic: string | null
    mode: string | null
    status: string | null
    progress: number | null
    error: string | null
    queries: string | null
    articlesFound: number | null
    articlesProcessed: number | null
    startTime: Date | null
    endTime: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    includedIds: string | null
    excludedIds: string | null
    exclusionReasons: string | null
    reviewText: string | null
    graphId: string | null
  }

  export type ResearchJobMaxAggregateOutputType = {
    id: string | null
    topic: string | null
    mode: string | null
    status: string | null
    progress: number | null
    error: string | null
    queries: string | null
    articlesFound: number | null
    articlesProcessed: number | null
    startTime: Date | null
    endTime: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    includedIds: string | null
    excludedIds: string | null
    exclusionReasons: string | null
    reviewText: string | null
    graphId: string | null
  }

  export type ResearchJobCountAggregateOutputType = {
    id: number
    topic: number
    mode: number
    status: number
    progress: number
    error: number
    queries: number
    articlesFound: number
    articlesProcessed: number
    startTime: number
    endTime: number
    createdAt: number
    updatedAt: number
    includedIds: number
    excludedIds: number
    exclusionReasons: number
    reviewText: number
    graphId: number
    _all: number
  }


  export type ResearchJobAvgAggregateInputType = {
    progress?: true
    articlesFound?: true
    articlesProcessed?: true
  }

  export type ResearchJobSumAggregateInputType = {
    progress?: true
    articlesFound?: true
    articlesProcessed?: true
  }

  export type ResearchJobMinAggregateInputType = {
    id?: true
    topic?: true
    mode?: true
    status?: true
    progress?: true
    error?: true
    queries?: true
    articlesFound?: true
    articlesProcessed?: true
    startTime?: true
    endTime?: true
    createdAt?: true
    updatedAt?: true
    includedIds?: true
    excludedIds?: true
    exclusionReasons?: true
    reviewText?: true
    graphId?: true
  }

  export type ResearchJobMaxAggregateInputType = {
    id?: true
    topic?: true
    mode?: true
    status?: true
    progress?: true
    error?: true
    queries?: true
    articlesFound?: true
    articlesProcessed?: true
    startTime?: true
    endTime?: true
    createdAt?: true
    updatedAt?: true
    includedIds?: true
    excludedIds?: true
    exclusionReasons?: true
    reviewText?: true
    graphId?: true
  }

  export type ResearchJobCountAggregateInputType = {
    id?: true
    topic?: true
    mode?: true
    status?: true
    progress?: true
    error?: true
    queries?: true
    articlesFound?: true
    articlesProcessed?: true
    startTime?: true
    endTime?: true
    createdAt?: true
    updatedAt?: true
    includedIds?: true
    excludedIds?: true
    exclusionReasons?: true
    reviewText?: true
    graphId?: true
    _all?: true
  }

  export type ResearchJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ResearchJob to aggregate.
     */
    where?: ResearchJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchJobs to fetch.
     */
    orderBy?: ResearchJobOrderByWithRelationInput | ResearchJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ResearchJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ResearchJobs
    **/
    _count?: true | ResearchJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ResearchJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ResearchJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResearchJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResearchJobMaxAggregateInputType
  }

  export type GetResearchJobAggregateType<T extends ResearchJobAggregateArgs> = {
        [P in keyof T & keyof AggregateResearchJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResearchJob[P]>
      : GetScalarType<T[P], AggregateResearchJob[P]>
  }




  export type ResearchJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResearchJobWhereInput
    orderBy?: ResearchJobOrderByWithAggregationInput | ResearchJobOrderByWithAggregationInput[]
    by: ResearchJobScalarFieldEnum[] | ResearchJobScalarFieldEnum
    having?: ResearchJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResearchJobCountAggregateInputType | true
    _avg?: ResearchJobAvgAggregateInputType
    _sum?: ResearchJobSumAggregateInputType
    _min?: ResearchJobMinAggregateInputType
    _max?: ResearchJobMaxAggregateInputType
  }

  export type ResearchJobGroupByOutputType = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime: Date | null
    endTime: Date | null
    createdAt: Date
    updatedAt: Date
    includedIds: string | null
    excludedIds: string | null
    exclusionReasons: string | null
    reviewText: string | null
    graphId: string | null
    _count: ResearchJobCountAggregateOutputType | null
    _avg: ResearchJobAvgAggregateOutputType | null
    _sum: ResearchJobSumAggregateOutputType | null
    _min: ResearchJobMinAggregateOutputType | null
    _max: ResearchJobMaxAggregateOutputType | null
  }

  type GetResearchJobGroupByPayload<T extends ResearchJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResearchJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResearchJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResearchJobGroupByOutputType[P]>
            : GetScalarType<T[P], ResearchJobGroupByOutputType[P]>
        }
      >
    >


  export type ResearchJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    topic?: boolean
    mode?: boolean
    status?: boolean
    progress?: boolean
    error?: boolean
    queries?: boolean
    articlesFound?: boolean
    articlesProcessed?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    includedIds?: boolean
    excludedIds?: boolean
    exclusionReasons?: boolean
    reviewText?: boolean
    graphId?: boolean
    articles?: boolean | ResearchJob$articlesArgs<ExtArgs>
    graph?: boolean | ResearchJob$graphArgs<ExtArgs>
    _count?: boolean | ResearchJobCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["researchJob"]>

  export type ResearchJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    topic?: boolean
    mode?: boolean
    status?: boolean
    progress?: boolean
    error?: boolean
    queries?: boolean
    articlesFound?: boolean
    articlesProcessed?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    includedIds?: boolean
    excludedIds?: boolean
    exclusionReasons?: boolean
    reviewText?: boolean
    graphId?: boolean
    graph?: boolean | ResearchJob$graphArgs<ExtArgs>
  }, ExtArgs["result"]["researchJob"]>

  export type ResearchJobSelectScalar = {
    id?: boolean
    topic?: boolean
    mode?: boolean
    status?: boolean
    progress?: boolean
    error?: boolean
    queries?: boolean
    articlesFound?: boolean
    articlesProcessed?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    includedIds?: boolean
    excludedIds?: boolean
    exclusionReasons?: boolean
    reviewText?: boolean
    graphId?: boolean
  }

  export type ResearchJobInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    articles?: boolean | ResearchJob$articlesArgs<ExtArgs>
    graph?: boolean | ResearchJob$graphArgs<ExtArgs>
    _count?: boolean | ResearchJobCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ResearchJobIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    graph?: boolean | ResearchJob$graphArgs<ExtArgs>
  }

  export type $ResearchJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ResearchJob"
    objects: {
      articles: Prisma.$ArticlePayload<ExtArgs>[]
      graph: Prisma.$GraphPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      topic: string
      mode: string
      status: string
      progress: number
      error: string | null
      queries: string
      articlesFound: number
      articlesProcessed: number
      startTime: Date | null
      endTime: Date | null
      createdAt: Date
      updatedAt: Date
      includedIds: string | null
      excludedIds: string | null
      exclusionReasons: string | null
      reviewText: string | null
      graphId: string | null
    }, ExtArgs["result"]["researchJob"]>
    composites: {}
  }

  type ResearchJobGetPayload<S extends boolean | null | undefined | ResearchJobDefaultArgs> = $Result.GetResult<Prisma.$ResearchJobPayload, S>

  type ResearchJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ResearchJobFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ResearchJobCountAggregateInputType | true
    }

  export interface ResearchJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ResearchJob'], meta: { name: 'ResearchJob' } }
    /**
     * Find zero or one ResearchJob that matches the filter.
     * @param {ResearchJobFindUniqueArgs} args - Arguments to find a ResearchJob
     * @example
     * // Get one ResearchJob
     * const researchJob = await prisma.researchJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ResearchJobFindUniqueArgs>(args: SelectSubset<T, ResearchJobFindUniqueArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ResearchJob that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ResearchJobFindUniqueOrThrowArgs} args - Arguments to find a ResearchJob
     * @example
     * // Get one ResearchJob
     * const researchJob = await prisma.researchJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ResearchJobFindUniqueOrThrowArgs>(args: SelectSubset<T, ResearchJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ResearchJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobFindFirstArgs} args - Arguments to find a ResearchJob
     * @example
     * // Get one ResearchJob
     * const researchJob = await prisma.researchJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ResearchJobFindFirstArgs>(args?: SelectSubset<T, ResearchJobFindFirstArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ResearchJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobFindFirstOrThrowArgs} args - Arguments to find a ResearchJob
     * @example
     * // Get one ResearchJob
     * const researchJob = await prisma.researchJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ResearchJobFindFirstOrThrowArgs>(args?: SelectSubset<T, ResearchJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ResearchJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ResearchJobs
     * const researchJobs = await prisma.researchJob.findMany()
     * 
     * // Get first 10 ResearchJobs
     * const researchJobs = await prisma.researchJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const researchJobWithIdOnly = await prisma.researchJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ResearchJobFindManyArgs>(args?: SelectSubset<T, ResearchJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ResearchJob.
     * @param {ResearchJobCreateArgs} args - Arguments to create a ResearchJob.
     * @example
     * // Create one ResearchJob
     * const ResearchJob = await prisma.researchJob.create({
     *   data: {
     *     // ... data to create a ResearchJob
     *   }
     * })
     * 
     */
    create<T extends ResearchJobCreateArgs>(args: SelectSubset<T, ResearchJobCreateArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ResearchJobs.
     * @param {ResearchJobCreateManyArgs} args - Arguments to create many ResearchJobs.
     * @example
     * // Create many ResearchJobs
     * const researchJob = await prisma.researchJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ResearchJobCreateManyArgs>(args?: SelectSubset<T, ResearchJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ResearchJobs and returns the data saved in the database.
     * @param {ResearchJobCreateManyAndReturnArgs} args - Arguments to create many ResearchJobs.
     * @example
     * // Create many ResearchJobs
     * const researchJob = await prisma.researchJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ResearchJobs and only return the `id`
     * const researchJobWithIdOnly = await prisma.researchJob.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ResearchJobCreateManyAndReturnArgs>(args?: SelectSubset<T, ResearchJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ResearchJob.
     * @param {ResearchJobDeleteArgs} args - Arguments to delete one ResearchJob.
     * @example
     * // Delete one ResearchJob
     * const ResearchJob = await prisma.researchJob.delete({
     *   where: {
     *     // ... filter to delete one ResearchJob
     *   }
     * })
     * 
     */
    delete<T extends ResearchJobDeleteArgs>(args: SelectSubset<T, ResearchJobDeleteArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ResearchJob.
     * @param {ResearchJobUpdateArgs} args - Arguments to update one ResearchJob.
     * @example
     * // Update one ResearchJob
     * const researchJob = await prisma.researchJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ResearchJobUpdateArgs>(args: SelectSubset<T, ResearchJobUpdateArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ResearchJobs.
     * @param {ResearchJobDeleteManyArgs} args - Arguments to filter ResearchJobs to delete.
     * @example
     * // Delete a few ResearchJobs
     * const { count } = await prisma.researchJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ResearchJobDeleteManyArgs>(args?: SelectSubset<T, ResearchJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResearchJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ResearchJobs
     * const researchJob = await prisma.researchJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ResearchJobUpdateManyArgs>(args: SelectSubset<T, ResearchJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ResearchJob.
     * @param {ResearchJobUpsertArgs} args - Arguments to update or create a ResearchJob.
     * @example
     * // Update or create a ResearchJob
     * const researchJob = await prisma.researchJob.upsert({
     *   create: {
     *     // ... data to create a ResearchJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ResearchJob we want to update
     *   }
     * })
     */
    upsert<T extends ResearchJobUpsertArgs>(args: SelectSubset<T, ResearchJobUpsertArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ResearchJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobCountArgs} args - Arguments to filter ResearchJobs to count.
     * @example
     * // Count the number of ResearchJobs
     * const count = await prisma.researchJob.count({
     *   where: {
     *     // ... the filter for the ResearchJobs we want to count
     *   }
     * })
    **/
    count<T extends ResearchJobCountArgs>(
      args?: Subset<T, ResearchJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResearchJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ResearchJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ResearchJobAggregateArgs>(args: Subset<T, ResearchJobAggregateArgs>): Prisma.PrismaPromise<GetResearchJobAggregateType<T>>

    /**
     * Group by ResearchJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ResearchJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ResearchJobGroupByArgs['orderBy'] }
        : { orderBy?: ResearchJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ResearchJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResearchJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ResearchJob model
   */
  readonly fields: ResearchJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ResearchJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ResearchJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    articles<T extends ResearchJob$articlesArgs<ExtArgs> = {}>(args?: Subset<T, ResearchJob$articlesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "findMany"> | Null>
    graph<T extends ResearchJob$graphArgs<ExtArgs> = {}>(args?: Subset<T, ResearchJob$graphArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ResearchJob model
   */ 
  interface ResearchJobFieldRefs {
    readonly id: FieldRef<"ResearchJob", 'String'>
    readonly topic: FieldRef<"ResearchJob", 'String'>
    readonly mode: FieldRef<"ResearchJob", 'String'>
    readonly status: FieldRef<"ResearchJob", 'String'>
    readonly progress: FieldRef<"ResearchJob", 'Int'>
    readonly error: FieldRef<"ResearchJob", 'String'>
    readonly queries: FieldRef<"ResearchJob", 'String'>
    readonly articlesFound: FieldRef<"ResearchJob", 'Int'>
    readonly articlesProcessed: FieldRef<"ResearchJob", 'Int'>
    readonly startTime: FieldRef<"ResearchJob", 'DateTime'>
    readonly endTime: FieldRef<"ResearchJob", 'DateTime'>
    readonly createdAt: FieldRef<"ResearchJob", 'DateTime'>
    readonly updatedAt: FieldRef<"ResearchJob", 'DateTime'>
    readonly includedIds: FieldRef<"ResearchJob", 'String'>
    readonly excludedIds: FieldRef<"ResearchJob", 'String'>
    readonly exclusionReasons: FieldRef<"ResearchJob", 'String'>
    readonly reviewText: FieldRef<"ResearchJob", 'String'>
    readonly graphId: FieldRef<"ResearchJob", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ResearchJob findUnique
   */
  export type ResearchJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * Filter, which ResearchJob to fetch.
     */
    where: ResearchJobWhereUniqueInput
  }

  /**
   * ResearchJob findUniqueOrThrow
   */
  export type ResearchJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * Filter, which ResearchJob to fetch.
     */
    where: ResearchJobWhereUniqueInput
  }

  /**
   * ResearchJob findFirst
   */
  export type ResearchJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * Filter, which ResearchJob to fetch.
     */
    where?: ResearchJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchJobs to fetch.
     */
    orderBy?: ResearchJobOrderByWithRelationInput | ResearchJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ResearchJobs.
     */
    cursor?: ResearchJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ResearchJobs.
     */
    distinct?: ResearchJobScalarFieldEnum | ResearchJobScalarFieldEnum[]
  }

  /**
   * ResearchJob findFirstOrThrow
   */
  export type ResearchJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * Filter, which ResearchJob to fetch.
     */
    where?: ResearchJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchJobs to fetch.
     */
    orderBy?: ResearchJobOrderByWithRelationInput | ResearchJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ResearchJobs.
     */
    cursor?: ResearchJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ResearchJobs.
     */
    distinct?: ResearchJobScalarFieldEnum | ResearchJobScalarFieldEnum[]
  }

  /**
   * ResearchJob findMany
   */
  export type ResearchJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * Filter, which ResearchJobs to fetch.
     */
    where?: ResearchJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchJobs to fetch.
     */
    orderBy?: ResearchJobOrderByWithRelationInput | ResearchJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ResearchJobs.
     */
    cursor?: ResearchJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchJobs.
     */
    skip?: number
    distinct?: ResearchJobScalarFieldEnum | ResearchJobScalarFieldEnum[]
  }

  /**
   * ResearchJob create
   */
  export type ResearchJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * The data needed to create a ResearchJob.
     */
    data: XOR<ResearchJobCreateInput, ResearchJobUncheckedCreateInput>
  }

  /**
   * ResearchJob createMany
   */
  export type ResearchJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ResearchJobs.
     */
    data: ResearchJobCreateManyInput | ResearchJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ResearchJob createManyAndReturn
   */
  export type ResearchJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ResearchJobs.
     */
    data: ResearchJobCreateManyInput | ResearchJobCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ResearchJob update
   */
  export type ResearchJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * The data needed to update a ResearchJob.
     */
    data: XOR<ResearchJobUpdateInput, ResearchJobUncheckedUpdateInput>
    /**
     * Choose, which ResearchJob to update.
     */
    where: ResearchJobWhereUniqueInput
  }

  /**
   * ResearchJob updateMany
   */
  export type ResearchJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ResearchJobs.
     */
    data: XOR<ResearchJobUpdateManyMutationInput, ResearchJobUncheckedUpdateManyInput>
    /**
     * Filter which ResearchJobs to update
     */
    where?: ResearchJobWhereInput
  }

  /**
   * ResearchJob upsert
   */
  export type ResearchJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * The filter to search for the ResearchJob to update in case it exists.
     */
    where: ResearchJobWhereUniqueInput
    /**
     * In case the ResearchJob found by the `where` argument doesn't exist, create a new ResearchJob with this data.
     */
    create: XOR<ResearchJobCreateInput, ResearchJobUncheckedCreateInput>
    /**
     * In case the ResearchJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ResearchJobUpdateInput, ResearchJobUncheckedUpdateInput>
  }

  /**
   * ResearchJob delete
   */
  export type ResearchJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    /**
     * Filter which ResearchJob to delete.
     */
    where: ResearchJobWhereUniqueInput
  }

  /**
   * ResearchJob deleteMany
   */
  export type ResearchJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ResearchJobs to delete
     */
    where?: ResearchJobWhereInput
  }

  /**
   * ResearchJob.articles
   */
  export type ResearchJob$articlesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    where?: ArticleWhereInput
    orderBy?: ArticleOrderByWithRelationInput | ArticleOrderByWithRelationInput[]
    cursor?: ArticleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * ResearchJob.graph
   */
  export type ResearchJob$graphArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    where?: GraphWhereInput
  }

  /**
   * ResearchJob without action
   */
  export type ResearchJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
  }


  /**
   * Model Article
   */

  export type AggregateArticle = {
    _count: ArticleCountAggregateOutputType | null
    _avg: ArticleAvgAggregateOutputType | null
    _sum: ArticleSumAggregateOutputType | null
    _min: ArticleMinAggregateOutputType | null
    _max: ArticleMaxAggregateOutputType | null
  }

  export type ArticleAvgAggregateOutputType = {
    year: number | null
  }

  export type ArticleSumAggregateOutputType = {
    year: number | null
  }

  export type ArticleMinAggregateOutputType = {
    id: string | null
    jobId: string | null
    doi: string | null
    title: string | null
    authors: string | null
    year: number | null
    abstract: string | null
    url: string | null
    pdfUrl: string | null
    source: string | null
    status: string | null
    screeningStatus: string | null
    extractedData: string | null
    entities: string | null
    relations: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArticleMaxAggregateOutputType = {
    id: string | null
    jobId: string | null
    doi: string | null
    title: string | null
    authors: string | null
    year: number | null
    abstract: string | null
    url: string | null
    pdfUrl: string | null
    source: string | null
    status: string | null
    screeningStatus: string | null
    extractedData: string | null
    entities: string | null
    relations: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArticleCountAggregateOutputType = {
    id: number
    jobId: number
    doi: number
    title: number
    authors: number
    year: number
    abstract: number
    url: number
    pdfUrl: number
    source: number
    status: number
    screeningStatus: number
    extractedData: number
    entities: number
    relations: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ArticleAvgAggregateInputType = {
    year?: true
  }

  export type ArticleSumAggregateInputType = {
    year?: true
  }

  export type ArticleMinAggregateInputType = {
    id?: true
    jobId?: true
    doi?: true
    title?: true
    authors?: true
    year?: true
    abstract?: true
    url?: true
    pdfUrl?: true
    source?: true
    status?: true
    screeningStatus?: true
    extractedData?: true
    entities?: true
    relations?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArticleMaxAggregateInputType = {
    id?: true
    jobId?: true
    doi?: true
    title?: true
    authors?: true
    year?: true
    abstract?: true
    url?: true
    pdfUrl?: true
    source?: true
    status?: true
    screeningStatus?: true
    extractedData?: true
    entities?: true
    relations?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArticleCountAggregateInputType = {
    id?: true
    jobId?: true
    doi?: true
    title?: true
    authors?: true
    year?: true
    abstract?: true
    url?: true
    pdfUrl?: true
    source?: true
    status?: true
    screeningStatus?: true
    extractedData?: true
    entities?: true
    relations?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ArticleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Article to aggregate.
     */
    where?: ArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Articles to fetch.
     */
    orderBy?: ArticleOrderByWithRelationInput | ArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Articles
    **/
    _count?: true | ArticleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ArticleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ArticleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ArticleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ArticleMaxAggregateInputType
  }

  export type GetArticleAggregateType<T extends ArticleAggregateArgs> = {
        [P in keyof T & keyof AggregateArticle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateArticle[P]>
      : GetScalarType<T[P], AggregateArticle[P]>
  }




  export type ArticleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ArticleWhereInput
    orderBy?: ArticleOrderByWithAggregationInput | ArticleOrderByWithAggregationInput[]
    by: ArticleScalarFieldEnum[] | ArticleScalarFieldEnum
    having?: ArticleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ArticleCountAggregateInputType | true
    _avg?: ArticleAvgAggregateInputType
    _sum?: ArticleSumAggregateInputType
    _min?: ArticleMinAggregateInputType
    _max?: ArticleMaxAggregateInputType
  }

  export type ArticleGroupByOutputType = {
    id: string
    jobId: string
    doi: string | null
    title: string
    authors: string
    year: number | null
    abstract: string | null
    url: string | null
    pdfUrl: string | null
    source: string
    status: string
    screeningStatus: string | null
    extractedData: string | null
    entities: string | null
    relations: string | null
    createdAt: Date
    updatedAt: Date
    _count: ArticleCountAggregateOutputType | null
    _avg: ArticleAvgAggregateOutputType | null
    _sum: ArticleSumAggregateOutputType | null
    _min: ArticleMinAggregateOutputType | null
    _max: ArticleMaxAggregateOutputType | null
  }

  type GetArticleGroupByPayload<T extends ArticleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ArticleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ArticleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ArticleGroupByOutputType[P]>
            : GetScalarType<T[P], ArticleGroupByOutputType[P]>
        }
      >
    >


  export type ArticleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    doi?: boolean
    title?: boolean
    authors?: boolean
    year?: boolean
    abstract?: boolean
    url?: boolean
    pdfUrl?: boolean
    source?: boolean
    status?: boolean
    screeningStatus?: boolean
    extractedData?: boolean
    entities?: boolean
    relations?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    job?: boolean | ResearchJobDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["article"]>

  export type ArticleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    doi?: boolean
    title?: boolean
    authors?: boolean
    year?: boolean
    abstract?: boolean
    url?: boolean
    pdfUrl?: boolean
    source?: boolean
    status?: boolean
    screeningStatus?: boolean
    extractedData?: boolean
    entities?: boolean
    relations?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    job?: boolean | ResearchJobDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["article"]>

  export type ArticleSelectScalar = {
    id?: boolean
    jobId?: boolean
    doi?: boolean
    title?: boolean
    authors?: boolean
    year?: boolean
    abstract?: boolean
    url?: boolean
    pdfUrl?: boolean
    source?: boolean
    status?: boolean
    screeningStatus?: boolean
    extractedData?: boolean
    entities?: boolean
    relations?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ArticleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    job?: boolean | ResearchJobDefaultArgs<ExtArgs>
  }
  export type ArticleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    job?: boolean | ResearchJobDefaultArgs<ExtArgs>
  }

  export type $ArticlePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Article"
    objects: {
      job: Prisma.$ResearchJobPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jobId: string
      doi: string | null
      title: string
      authors: string
      year: number | null
      abstract: string | null
      url: string | null
      pdfUrl: string | null
      source: string
      status: string
      screeningStatus: string | null
      extractedData: string | null
      entities: string | null
      relations: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["article"]>
    composites: {}
  }

  type ArticleGetPayload<S extends boolean | null | undefined | ArticleDefaultArgs> = $Result.GetResult<Prisma.$ArticlePayload, S>

  type ArticleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ArticleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ArticleCountAggregateInputType | true
    }

  export interface ArticleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Article'], meta: { name: 'Article' } }
    /**
     * Find zero or one Article that matches the filter.
     * @param {ArticleFindUniqueArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ArticleFindUniqueArgs>(args: SelectSubset<T, ArticleFindUniqueArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Article that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ArticleFindUniqueOrThrowArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ArticleFindUniqueOrThrowArgs>(args: SelectSubset<T, ArticleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Article that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleFindFirstArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ArticleFindFirstArgs>(args?: SelectSubset<T, ArticleFindFirstArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Article that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleFindFirstOrThrowArgs} args - Arguments to find a Article
     * @example
     * // Get one Article
     * const article = await prisma.article.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ArticleFindFirstOrThrowArgs>(args?: SelectSubset<T, ArticleFindFirstOrThrowArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Articles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Articles
     * const articles = await prisma.article.findMany()
     * 
     * // Get first 10 Articles
     * const articles = await prisma.article.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const articleWithIdOnly = await prisma.article.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ArticleFindManyArgs>(args?: SelectSubset<T, ArticleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Article.
     * @param {ArticleCreateArgs} args - Arguments to create a Article.
     * @example
     * // Create one Article
     * const Article = await prisma.article.create({
     *   data: {
     *     // ... data to create a Article
     *   }
     * })
     * 
     */
    create<T extends ArticleCreateArgs>(args: SelectSubset<T, ArticleCreateArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Articles.
     * @param {ArticleCreateManyArgs} args - Arguments to create many Articles.
     * @example
     * // Create many Articles
     * const article = await prisma.article.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ArticleCreateManyArgs>(args?: SelectSubset<T, ArticleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Articles and returns the data saved in the database.
     * @param {ArticleCreateManyAndReturnArgs} args - Arguments to create many Articles.
     * @example
     * // Create many Articles
     * const article = await prisma.article.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Articles and only return the `id`
     * const articleWithIdOnly = await prisma.article.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ArticleCreateManyAndReturnArgs>(args?: SelectSubset<T, ArticleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Article.
     * @param {ArticleDeleteArgs} args - Arguments to delete one Article.
     * @example
     * // Delete one Article
     * const Article = await prisma.article.delete({
     *   where: {
     *     // ... filter to delete one Article
     *   }
     * })
     * 
     */
    delete<T extends ArticleDeleteArgs>(args: SelectSubset<T, ArticleDeleteArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Article.
     * @param {ArticleUpdateArgs} args - Arguments to update one Article.
     * @example
     * // Update one Article
     * const article = await prisma.article.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ArticleUpdateArgs>(args: SelectSubset<T, ArticleUpdateArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Articles.
     * @param {ArticleDeleteManyArgs} args - Arguments to filter Articles to delete.
     * @example
     * // Delete a few Articles
     * const { count } = await prisma.article.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ArticleDeleteManyArgs>(args?: SelectSubset<T, ArticleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Articles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Articles
     * const article = await prisma.article.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ArticleUpdateManyArgs>(args: SelectSubset<T, ArticleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Article.
     * @param {ArticleUpsertArgs} args - Arguments to update or create a Article.
     * @example
     * // Update or create a Article
     * const article = await prisma.article.upsert({
     *   create: {
     *     // ... data to create a Article
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Article we want to update
     *   }
     * })
     */
    upsert<T extends ArticleUpsertArgs>(args: SelectSubset<T, ArticleUpsertArgs<ExtArgs>>): Prisma__ArticleClient<$Result.GetResult<Prisma.$ArticlePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Articles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleCountArgs} args - Arguments to filter Articles to count.
     * @example
     * // Count the number of Articles
     * const count = await prisma.article.count({
     *   where: {
     *     // ... the filter for the Articles we want to count
     *   }
     * })
    **/
    count<T extends ArticleCountArgs>(
      args?: Subset<T, ArticleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ArticleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Article.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ArticleAggregateArgs>(args: Subset<T, ArticleAggregateArgs>): Prisma.PrismaPromise<GetArticleAggregateType<T>>

    /**
     * Group by Article.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArticleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ArticleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ArticleGroupByArgs['orderBy'] }
        : { orderBy?: ArticleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ArticleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetArticleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Article model
   */
  readonly fields: ArticleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Article.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ArticleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    job<T extends ResearchJobDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ResearchJobDefaultArgs<ExtArgs>>): Prisma__ResearchJobClient<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Article model
   */ 
  interface ArticleFieldRefs {
    readonly id: FieldRef<"Article", 'String'>
    readonly jobId: FieldRef<"Article", 'String'>
    readonly doi: FieldRef<"Article", 'String'>
    readonly title: FieldRef<"Article", 'String'>
    readonly authors: FieldRef<"Article", 'String'>
    readonly year: FieldRef<"Article", 'Int'>
    readonly abstract: FieldRef<"Article", 'String'>
    readonly url: FieldRef<"Article", 'String'>
    readonly pdfUrl: FieldRef<"Article", 'String'>
    readonly source: FieldRef<"Article", 'String'>
    readonly status: FieldRef<"Article", 'String'>
    readonly screeningStatus: FieldRef<"Article", 'String'>
    readonly extractedData: FieldRef<"Article", 'String'>
    readonly entities: FieldRef<"Article", 'String'>
    readonly relations: FieldRef<"Article", 'String'>
    readonly createdAt: FieldRef<"Article", 'DateTime'>
    readonly updatedAt: FieldRef<"Article", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Article findUnique
   */
  export type ArticleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * Filter, which Article to fetch.
     */
    where: ArticleWhereUniqueInput
  }

  /**
   * Article findUniqueOrThrow
   */
  export type ArticleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * Filter, which Article to fetch.
     */
    where: ArticleWhereUniqueInput
  }

  /**
   * Article findFirst
   */
  export type ArticleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * Filter, which Article to fetch.
     */
    where?: ArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Articles to fetch.
     */
    orderBy?: ArticleOrderByWithRelationInput | ArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Articles.
     */
    cursor?: ArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Articles.
     */
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * Article findFirstOrThrow
   */
  export type ArticleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * Filter, which Article to fetch.
     */
    where?: ArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Articles to fetch.
     */
    orderBy?: ArticleOrderByWithRelationInput | ArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Articles.
     */
    cursor?: ArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Articles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Articles.
     */
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * Article findMany
   */
  export type ArticleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * Filter, which Articles to fetch.
     */
    where?: ArticleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Articles to fetch.
     */
    orderBy?: ArticleOrderByWithRelationInput | ArticleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Articles.
     */
    cursor?: ArticleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Articles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Articles.
     */
    skip?: number
    distinct?: ArticleScalarFieldEnum | ArticleScalarFieldEnum[]
  }

  /**
   * Article create
   */
  export type ArticleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * The data needed to create a Article.
     */
    data: XOR<ArticleCreateInput, ArticleUncheckedCreateInput>
  }

  /**
   * Article createMany
   */
  export type ArticleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Articles.
     */
    data: ArticleCreateManyInput | ArticleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Article createManyAndReturn
   */
  export type ArticleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Articles.
     */
    data: ArticleCreateManyInput | ArticleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Article update
   */
  export type ArticleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * The data needed to update a Article.
     */
    data: XOR<ArticleUpdateInput, ArticleUncheckedUpdateInput>
    /**
     * Choose, which Article to update.
     */
    where: ArticleWhereUniqueInput
  }

  /**
   * Article updateMany
   */
  export type ArticleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Articles.
     */
    data: XOR<ArticleUpdateManyMutationInput, ArticleUncheckedUpdateManyInput>
    /**
     * Filter which Articles to update
     */
    where?: ArticleWhereInput
  }

  /**
   * Article upsert
   */
  export type ArticleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * The filter to search for the Article to update in case it exists.
     */
    where: ArticleWhereUniqueInput
    /**
     * In case the Article found by the `where` argument doesn't exist, create a new Article with this data.
     */
    create: XOR<ArticleCreateInput, ArticleUncheckedCreateInput>
    /**
     * In case the Article was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ArticleUpdateInput, ArticleUncheckedUpdateInput>
  }

  /**
   * Article delete
   */
  export type ArticleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
    /**
     * Filter which Article to delete.
     */
    where: ArticleWhereUniqueInput
  }

  /**
   * Article deleteMany
   */
  export type ArticleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Articles to delete
     */
    where?: ArticleWhereInput
  }

  /**
   * Article without action
   */
  export type ArticleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Article
     */
    select?: ArticleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArticleInclude<ExtArgs> | null
  }


  /**
   * Model Graph
   */

  export type AggregateGraph = {
    _count: GraphCountAggregateOutputType | null
    _min: GraphMinAggregateOutputType | null
    _max: GraphMaxAggregateOutputType | null
  }

  export type GraphMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    version: string | null
    directed: boolean | null
    nodes: string | null
    edges: string | null
    metrics: string | null
    sources: string | null
    metadata: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GraphMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    version: string | null
    directed: boolean | null
    nodes: string | null
    edges: string | null
    metrics: string | null
    sources: string | null
    metadata: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GraphCountAggregateOutputType = {
    id: number
    name: number
    description: number
    version: number
    directed: number
    nodes: number
    edges: number
    metrics: number
    sources: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GraphMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    version?: true
    directed?: true
    nodes?: true
    edges?: true
    metrics?: true
    sources?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GraphMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    version?: true
    directed?: true
    nodes?: true
    edges?: true
    metrics?: true
    sources?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GraphCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    version?: true
    directed?: true
    nodes?: true
    edges?: true
    metrics?: true
    sources?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GraphAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Graph to aggregate.
     */
    where?: GraphWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Graphs to fetch.
     */
    orderBy?: GraphOrderByWithRelationInput | GraphOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GraphWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Graphs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Graphs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Graphs
    **/
    _count?: true | GraphCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GraphMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GraphMaxAggregateInputType
  }

  export type GetGraphAggregateType<T extends GraphAggregateArgs> = {
        [P in keyof T & keyof AggregateGraph]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGraph[P]>
      : GetScalarType<T[P], AggregateGraph[P]>
  }




  export type GraphGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraphWhereInput
    orderBy?: GraphOrderByWithAggregationInput | GraphOrderByWithAggregationInput[]
    by: GraphScalarFieldEnum[] | GraphScalarFieldEnum
    having?: GraphScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GraphCountAggregateInputType | true
    _min?: GraphMinAggregateInputType
    _max?: GraphMaxAggregateInputType
  }

  export type GraphGroupByOutputType = {
    id: string
    name: string
    description: string | null
    version: string
    directed: boolean
    nodes: string
    edges: string
    metrics: string | null
    sources: string | null
    metadata: string | null
    createdAt: Date
    updatedAt: Date
    _count: GraphCountAggregateOutputType | null
    _min: GraphMinAggregateOutputType | null
    _max: GraphMaxAggregateOutputType | null
  }

  type GetGraphGroupByPayload<T extends GraphGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GraphGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GraphGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GraphGroupByOutputType[P]>
            : GetScalarType<T[P], GraphGroupByOutputType[P]>
        }
      >
    >


  export type GraphSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    version?: boolean
    directed?: boolean
    nodes?: boolean
    edges?: boolean
    metrics?: boolean
    sources?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    jobs?: boolean | Graph$jobsArgs<ExtArgs>
    detailedNodes?: boolean | Graph$detailedNodesArgs<ExtArgs>
    detailedEdges?: boolean | Graph$detailedEdgesArgs<ExtArgs>
    _count?: boolean | GraphCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graph"]>

  export type GraphSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    version?: boolean
    directed?: boolean
    nodes?: boolean
    edges?: boolean
    metrics?: boolean
    sources?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["graph"]>

  export type GraphSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    version?: boolean
    directed?: boolean
    nodes?: boolean
    edges?: boolean
    metrics?: boolean
    sources?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GraphInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobs?: boolean | Graph$jobsArgs<ExtArgs>
    detailedNodes?: boolean | Graph$detailedNodesArgs<ExtArgs>
    detailedEdges?: boolean | Graph$detailedEdgesArgs<ExtArgs>
    _count?: boolean | GraphCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GraphIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $GraphPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Graph"
    objects: {
      jobs: Prisma.$ResearchJobPayload<ExtArgs>[]
      detailedNodes: Prisma.$GraphNodePayload<ExtArgs>[]
      detailedEdges: Prisma.$GraphEdgePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      version: string
      directed: boolean
      nodes: string
      edges: string
      metrics: string | null
      sources: string | null
      metadata: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["graph"]>
    composites: {}
  }

  type GraphGetPayload<S extends boolean | null | undefined | GraphDefaultArgs> = $Result.GetResult<Prisma.$GraphPayload, S>

  type GraphCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GraphFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GraphCountAggregateInputType | true
    }

  export interface GraphDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Graph'], meta: { name: 'Graph' } }
    /**
     * Find zero or one Graph that matches the filter.
     * @param {GraphFindUniqueArgs} args - Arguments to find a Graph
     * @example
     * // Get one Graph
     * const graph = await prisma.graph.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GraphFindUniqueArgs>(args: SelectSubset<T, GraphFindUniqueArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Graph that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GraphFindUniqueOrThrowArgs} args - Arguments to find a Graph
     * @example
     * // Get one Graph
     * const graph = await prisma.graph.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GraphFindUniqueOrThrowArgs>(args: SelectSubset<T, GraphFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Graph that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphFindFirstArgs} args - Arguments to find a Graph
     * @example
     * // Get one Graph
     * const graph = await prisma.graph.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GraphFindFirstArgs>(args?: SelectSubset<T, GraphFindFirstArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Graph that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphFindFirstOrThrowArgs} args - Arguments to find a Graph
     * @example
     * // Get one Graph
     * const graph = await prisma.graph.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GraphFindFirstOrThrowArgs>(args?: SelectSubset<T, GraphFindFirstOrThrowArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Graphs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Graphs
     * const graphs = await prisma.graph.findMany()
     * 
     * // Get first 10 Graphs
     * const graphs = await prisma.graph.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const graphWithIdOnly = await prisma.graph.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GraphFindManyArgs>(args?: SelectSubset<T, GraphFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Graph.
     * @param {GraphCreateArgs} args - Arguments to create a Graph.
     * @example
     * // Create one Graph
     * const Graph = await prisma.graph.create({
     *   data: {
     *     // ... data to create a Graph
     *   }
     * })
     * 
     */
    create<T extends GraphCreateArgs>(args: SelectSubset<T, GraphCreateArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Graphs.
     * @param {GraphCreateManyArgs} args - Arguments to create many Graphs.
     * @example
     * // Create many Graphs
     * const graph = await prisma.graph.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GraphCreateManyArgs>(args?: SelectSubset<T, GraphCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Graphs and returns the data saved in the database.
     * @param {GraphCreateManyAndReturnArgs} args - Arguments to create many Graphs.
     * @example
     * // Create many Graphs
     * const graph = await prisma.graph.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Graphs and only return the `id`
     * const graphWithIdOnly = await prisma.graph.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GraphCreateManyAndReturnArgs>(args?: SelectSubset<T, GraphCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Graph.
     * @param {GraphDeleteArgs} args - Arguments to delete one Graph.
     * @example
     * // Delete one Graph
     * const Graph = await prisma.graph.delete({
     *   where: {
     *     // ... filter to delete one Graph
     *   }
     * })
     * 
     */
    delete<T extends GraphDeleteArgs>(args: SelectSubset<T, GraphDeleteArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Graph.
     * @param {GraphUpdateArgs} args - Arguments to update one Graph.
     * @example
     * // Update one Graph
     * const graph = await prisma.graph.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GraphUpdateArgs>(args: SelectSubset<T, GraphUpdateArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Graphs.
     * @param {GraphDeleteManyArgs} args - Arguments to filter Graphs to delete.
     * @example
     * // Delete a few Graphs
     * const { count } = await prisma.graph.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GraphDeleteManyArgs>(args?: SelectSubset<T, GraphDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Graphs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Graphs
     * const graph = await prisma.graph.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GraphUpdateManyArgs>(args: SelectSubset<T, GraphUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Graph.
     * @param {GraphUpsertArgs} args - Arguments to update or create a Graph.
     * @example
     * // Update or create a Graph
     * const graph = await prisma.graph.upsert({
     *   create: {
     *     // ... data to create a Graph
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Graph we want to update
     *   }
     * })
     */
    upsert<T extends GraphUpsertArgs>(args: SelectSubset<T, GraphUpsertArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Graphs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphCountArgs} args - Arguments to filter Graphs to count.
     * @example
     * // Count the number of Graphs
     * const count = await prisma.graph.count({
     *   where: {
     *     // ... the filter for the Graphs we want to count
     *   }
     * })
    **/
    count<T extends GraphCountArgs>(
      args?: Subset<T, GraphCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GraphCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Graph.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GraphAggregateArgs>(args: Subset<T, GraphAggregateArgs>): Prisma.PrismaPromise<GetGraphAggregateType<T>>

    /**
     * Group by Graph.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GraphGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GraphGroupByArgs['orderBy'] }
        : { orderBy?: GraphGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GraphGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGraphGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Graph model
   */
  readonly fields: GraphFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Graph.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GraphClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    jobs<T extends Graph$jobsArgs<ExtArgs> = {}>(args?: Subset<T, Graph$jobsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchJobPayload<ExtArgs>, T, "findMany"> | Null>
    detailedNodes<T extends Graph$detailedNodesArgs<ExtArgs> = {}>(args?: Subset<T, Graph$detailedNodesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "findMany"> | Null>
    detailedEdges<T extends Graph$detailedEdgesArgs<ExtArgs> = {}>(args?: Subset<T, Graph$detailedEdgesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Graph model
   */ 
  interface GraphFieldRefs {
    readonly id: FieldRef<"Graph", 'String'>
    readonly name: FieldRef<"Graph", 'String'>
    readonly description: FieldRef<"Graph", 'String'>
    readonly version: FieldRef<"Graph", 'String'>
    readonly directed: FieldRef<"Graph", 'Boolean'>
    readonly nodes: FieldRef<"Graph", 'String'>
    readonly edges: FieldRef<"Graph", 'String'>
    readonly metrics: FieldRef<"Graph", 'String'>
    readonly sources: FieldRef<"Graph", 'String'>
    readonly metadata: FieldRef<"Graph", 'String'>
    readonly createdAt: FieldRef<"Graph", 'DateTime'>
    readonly updatedAt: FieldRef<"Graph", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Graph findUnique
   */
  export type GraphFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * Filter, which Graph to fetch.
     */
    where: GraphWhereUniqueInput
  }

  /**
   * Graph findUniqueOrThrow
   */
  export type GraphFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * Filter, which Graph to fetch.
     */
    where: GraphWhereUniqueInput
  }

  /**
   * Graph findFirst
   */
  export type GraphFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * Filter, which Graph to fetch.
     */
    where?: GraphWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Graphs to fetch.
     */
    orderBy?: GraphOrderByWithRelationInput | GraphOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Graphs.
     */
    cursor?: GraphWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Graphs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Graphs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Graphs.
     */
    distinct?: GraphScalarFieldEnum | GraphScalarFieldEnum[]
  }

  /**
   * Graph findFirstOrThrow
   */
  export type GraphFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * Filter, which Graph to fetch.
     */
    where?: GraphWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Graphs to fetch.
     */
    orderBy?: GraphOrderByWithRelationInput | GraphOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Graphs.
     */
    cursor?: GraphWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Graphs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Graphs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Graphs.
     */
    distinct?: GraphScalarFieldEnum | GraphScalarFieldEnum[]
  }

  /**
   * Graph findMany
   */
  export type GraphFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * Filter, which Graphs to fetch.
     */
    where?: GraphWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Graphs to fetch.
     */
    orderBy?: GraphOrderByWithRelationInput | GraphOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Graphs.
     */
    cursor?: GraphWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Graphs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Graphs.
     */
    skip?: number
    distinct?: GraphScalarFieldEnum | GraphScalarFieldEnum[]
  }

  /**
   * Graph create
   */
  export type GraphCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * The data needed to create a Graph.
     */
    data: XOR<GraphCreateInput, GraphUncheckedCreateInput>
  }

  /**
   * Graph createMany
   */
  export type GraphCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Graphs.
     */
    data: GraphCreateManyInput | GraphCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Graph createManyAndReturn
   */
  export type GraphCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Graphs.
     */
    data: GraphCreateManyInput | GraphCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Graph update
   */
  export type GraphUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * The data needed to update a Graph.
     */
    data: XOR<GraphUpdateInput, GraphUncheckedUpdateInput>
    /**
     * Choose, which Graph to update.
     */
    where: GraphWhereUniqueInput
  }

  /**
   * Graph updateMany
   */
  export type GraphUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Graphs.
     */
    data: XOR<GraphUpdateManyMutationInput, GraphUncheckedUpdateManyInput>
    /**
     * Filter which Graphs to update
     */
    where?: GraphWhereInput
  }

  /**
   * Graph upsert
   */
  export type GraphUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * The filter to search for the Graph to update in case it exists.
     */
    where: GraphWhereUniqueInput
    /**
     * In case the Graph found by the `where` argument doesn't exist, create a new Graph with this data.
     */
    create: XOR<GraphCreateInput, GraphUncheckedCreateInput>
    /**
     * In case the Graph was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GraphUpdateInput, GraphUncheckedUpdateInput>
  }

  /**
   * Graph delete
   */
  export type GraphDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
    /**
     * Filter which Graph to delete.
     */
    where: GraphWhereUniqueInput
  }

  /**
   * Graph deleteMany
   */
  export type GraphDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Graphs to delete
     */
    where?: GraphWhereInput
  }

  /**
   * Graph.jobs
   */
  export type Graph$jobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchJob
     */
    select?: ResearchJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchJobInclude<ExtArgs> | null
    where?: ResearchJobWhereInput
    orderBy?: ResearchJobOrderByWithRelationInput | ResearchJobOrderByWithRelationInput[]
    cursor?: ResearchJobWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ResearchJobScalarFieldEnum | ResearchJobScalarFieldEnum[]
  }

  /**
   * Graph.detailedNodes
   */
  export type Graph$detailedNodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    where?: GraphNodeWhereInput
    orderBy?: GraphNodeOrderByWithRelationInput | GraphNodeOrderByWithRelationInput[]
    cursor?: GraphNodeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GraphNodeScalarFieldEnum | GraphNodeScalarFieldEnum[]
  }

  /**
   * Graph.detailedEdges
   */
  export type Graph$detailedEdgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    where?: GraphEdgeWhereInput
    orderBy?: GraphEdgeOrderByWithRelationInput | GraphEdgeOrderByWithRelationInput[]
    cursor?: GraphEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GraphEdgeScalarFieldEnum | GraphEdgeScalarFieldEnum[]
  }

  /**
   * Graph without action
   */
  export type GraphDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Graph
     */
    select?: GraphSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphInclude<ExtArgs> | null
  }


  /**
   * Model GraphNode
   */

  export type AggregateGraphNode = {
    _count: GraphNodeCountAggregateOutputType | null
    _min: GraphNodeMinAggregateOutputType | null
    _max: GraphNodeMaxAggregateOutputType | null
  }

  export type GraphNodeMinAggregateOutputType = {
    id: string | null
    graphId: string | null
    label: string | null
    name: string | null
    data: string | null
  }

  export type GraphNodeMaxAggregateOutputType = {
    id: string | null
    graphId: string | null
    label: string | null
    name: string | null
    data: string | null
  }

  export type GraphNodeCountAggregateOutputType = {
    id: number
    graphId: number
    label: number
    name: number
    data: number
    _all: number
  }


  export type GraphNodeMinAggregateInputType = {
    id?: true
    graphId?: true
    label?: true
    name?: true
    data?: true
  }

  export type GraphNodeMaxAggregateInputType = {
    id?: true
    graphId?: true
    label?: true
    name?: true
    data?: true
  }

  export type GraphNodeCountAggregateInputType = {
    id?: true
    graphId?: true
    label?: true
    name?: true
    data?: true
    _all?: true
  }

  export type GraphNodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GraphNode to aggregate.
     */
    where?: GraphNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphNodes to fetch.
     */
    orderBy?: GraphNodeOrderByWithRelationInput | GraphNodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GraphNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphNodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GraphNodes
    **/
    _count?: true | GraphNodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GraphNodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GraphNodeMaxAggregateInputType
  }

  export type GetGraphNodeAggregateType<T extends GraphNodeAggregateArgs> = {
        [P in keyof T & keyof AggregateGraphNode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGraphNode[P]>
      : GetScalarType<T[P], AggregateGraphNode[P]>
  }




  export type GraphNodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraphNodeWhereInput
    orderBy?: GraphNodeOrderByWithAggregationInput | GraphNodeOrderByWithAggregationInput[]
    by: GraphNodeScalarFieldEnum[] | GraphNodeScalarFieldEnum
    having?: GraphNodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GraphNodeCountAggregateInputType | true
    _min?: GraphNodeMinAggregateInputType
    _max?: GraphNodeMaxAggregateInputType
  }

  export type GraphNodeGroupByOutputType = {
    id: string
    graphId: string
    label: string
    name: string
    data: string
    _count: GraphNodeCountAggregateOutputType | null
    _min: GraphNodeMinAggregateOutputType | null
    _max: GraphNodeMaxAggregateOutputType | null
  }

  type GetGraphNodeGroupByPayload<T extends GraphNodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GraphNodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GraphNodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GraphNodeGroupByOutputType[P]>
            : GetScalarType<T[P], GraphNodeGroupByOutputType[P]>
        }
      >
    >


  export type GraphNodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    graphId?: boolean
    label?: boolean
    name?: boolean
    data?: boolean
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graphNode"]>

  export type GraphNodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    graphId?: boolean
    label?: boolean
    name?: boolean
    data?: boolean
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graphNode"]>

  export type GraphNodeSelectScalar = {
    id?: boolean
    graphId?: boolean
    label?: boolean
    name?: boolean
    data?: boolean
  }

  export type GraphNodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }
  export type GraphNodeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }

  export type $GraphNodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GraphNode"
    objects: {
      graph: Prisma.$GraphPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      graphId: string
      label: string
      name: string
      data: string
    }, ExtArgs["result"]["graphNode"]>
    composites: {}
  }

  type GraphNodeGetPayload<S extends boolean | null | undefined | GraphNodeDefaultArgs> = $Result.GetResult<Prisma.$GraphNodePayload, S>

  type GraphNodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GraphNodeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GraphNodeCountAggregateInputType | true
    }

  export interface GraphNodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GraphNode'], meta: { name: 'GraphNode' } }
    /**
     * Find zero or one GraphNode that matches the filter.
     * @param {GraphNodeFindUniqueArgs} args - Arguments to find a GraphNode
     * @example
     * // Get one GraphNode
     * const graphNode = await prisma.graphNode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GraphNodeFindUniqueArgs>(args: SelectSubset<T, GraphNodeFindUniqueArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GraphNode that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GraphNodeFindUniqueOrThrowArgs} args - Arguments to find a GraphNode
     * @example
     * // Get one GraphNode
     * const graphNode = await prisma.graphNode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GraphNodeFindUniqueOrThrowArgs>(args: SelectSubset<T, GraphNodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GraphNode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeFindFirstArgs} args - Arguments to find a GraphNode
     * @example
     * // Get one GraphNode
     * const graphNode = await prisma.graphNode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GraphNodeFindFirstArgs>(args?: SelectSubset<T, GraphNodeFindFirstArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GraphNode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeFindFirstOrThrowArgs} args - Arguments to find a GraphNode
     * @example
     * // Get one GraphNode
     * const graphNode = await prisma.graphNode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GraphNodeFindFirstOrThrowArgs>(args?: SelectSubset<T, GraphNodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GraphNodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GraphNodes
     * const graphNodes = await prisma.graphNode.findMany()
     * 
     * // Get first 10 GraphNodes
     * const graphNodes = await prisma.graphNode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const graphNodeWithIdOnly = await prisma.graphNode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GraphNodeFindManyArgs>(args?: SelectSubset<T, GraphNodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GraphNode.
     * @param {GraphNodeCreateArgs} args - Arguments to create a GraphNode.
     * @example
     * // Create one GraphNode
     * const GraphNode = await prisma.graphNode.create({
     *   data: {
     *     // ... data to create a GraphNode
     *   }
     * })
     * 
     */
    create<T extends GraphNodeCreateArgs>(args: SelectSubset<T, GraphNodeCreateArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GraphNodes.
     * @param {GraphNodeCreateManyArgs} args - Arguments to create many GraphNodes.
     * @example
     * // Create many GraphNodes
     * const graphNode = await prisma.graphNode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GraphNodeCreateManyArgs>(args?: SelectSubset<T, GraphNodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GraphNodes and returns the data saved in the database.
     * @param {GraphNodeCreateManyAndReturnArgs} args - Arguments to create many GraphNodes.
     * @example
     * // Create many GraphNodes
     * const graphNode = await prisma.graphNode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GraphNodes and only return the `id`
     * const graphNodeWithIdOnly = await prisma.graphNode.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GraphNodeCreateManyAndReturnArgs>(args?: SelectSubset<T, GraphNodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GraphNode.
     * @param {GraphNodeDeleteArgs} args - Arguments to delete one GraphNode.
     * @example
     * // Delete one GraphNode
     * const GraphNode = await prisma.graphNode.delete({
     *   where: {
     *     // ... filter to delete one GraphNode
     *   }
     * })
     * 
     */
    delete<T extends GraphNodeDeleteArgs>(args: SelectSubset<T, GraphNodeDeleteArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GraphNode.
     * @param {GraphNodeUpdateArgs} args - Arguments to update one GraphNode.
     * @example
     * // Update one GraphNode
     * const graphNode = await prisma.graphNode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GraphNodeUpdateArgs>(args: SelectSubset<T, GraphNodeUpdateArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GraphNodes.
     * @param {GraphNodeDeleteManyArgs} args - Arguments to filter GraphNodes to delete.
     * @example
     * // Delete a few GraphNodes
     * const { count } = await prisma.graphNode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GraphNodeDeleteManyArgs>(args?: SelectSubset<T, GraphNodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GraphNodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GraphNodes
     * const graphNode = await prisma.graphNode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GraphNodeUpdateManyArgs>(args: SelectSubset<T, GraphNodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GraphNode.
     * @param {GraphNodeUpsertArgs} args - Arguments to update or create a GraphNode.
     * @example
     * // Update or create a GraphNode
     * const graphNode = await prisma.graphNode.upsert({
     *   create: {
     *     // ... data to create a GraphNode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GraphNode we want to update
     *   }
     * })
     */
    upsert<T extends GraphNodeUpsertArgs>(args: SelectSubset<T, GraphNodeUpsertArgs<ExtArgs>>): Prisma__GraphNodeClient<$Result.GetResult<Prisma.$GraphNodePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GraphNodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeCountArgs} args - Arguments to filter GraphNodes to count.
     * @example
     * // Count the number of GraphNodes
     * const count = await prisma.graphNode.count({
     *   where: {
     *     // ... the filter for the GraphNodes we want to count
     *   }
     * })
    **/
    count<T extends GraphNodeCountArgs>(
      args?: Subset<T, GraphNodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GraphNodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GraphNode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GraphNodeAggregateArgs>(args: Subset<T, GraphNodeAggregateArgs>): Prisma.PrismaPromise<GetGraphNodeAggregateType<T>>

    /**
     * Group by GraphNode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphNodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GraphNodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GraphNodeGroupByArgs['orderBy'] }
        : { orderBy?: GraphNodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GraphNodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGraphNodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GraphNode model
   */
  readonly fields: GraphNodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GraphNode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GraphNodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    graph<T extends GraphDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GraphDefaultArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GraphNode model
   */ 
  interface GraphNodeFieldRefs {
    readonly id: FieldRef<"GraphNode", 'String'>
    readonly graphId: FieldRef<"GraphNode", 'String'>
    readonly label: FieldRef<"GraphNode", 'String'>
    readonly name: FieldRef<"GraphNode", 'String'>
    readonly data: FieldRef<"GraphNode", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GraphNode findUnique
   */
  export type GraphNodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * Filter, which GraphNode to fetch.
     */
    where: GraphNodeWhereUniqueInput
  }

  /**
   * GraphNode findUniqueOrThrow
   */
  export type GraphNodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * Filter, which GraphNode to fetch.
     */
    where: GraphNodeWhereUniqueInput
  }

  /**
   * GraphNode findFirst
   */
  export type GraphNodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * Filter, which GraphNode to fetch.
     */
    where?: GraphNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphNodes to fetch.
     */
    orderBy?: GraphNodeOrderByWithRelationInput | GraphNodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GraphNodes.
     */
    cursor?: GraphNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphNodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GraphNodes.
     */
    distinct?: GraphNodeScalarFieldEnum | GraphNodeScalarFieldEnum[]
  }

  /**
   * GraphNode findFirstOrThrow
   */
  export type GraphNodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * Filter, which GraphNode to fetch.
     */
    where?: GraphNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphNodes to fetch.
     */
    orderBy?: GraphNodeOrderByWithRelationInput | GraphNodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GraphNodes.
     */
    cursor?: GraphNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphNodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GraphNodes.
     */
    distinct?: GraphNodeScalarFieldEnum | GraphNodeScalarFieldEnum[]
  }

  /**
   * GraphNode findMany
   */
  export type GraphNodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * Filter, which GraphNodes to fetch.
     */
    where?: GraphNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphNodes to fetch.
     */
    orderBy?: GraphNodeOrderByWithRelationInput | GraphNodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GraphNodes.
     */
    cursor?: GraphNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphNodes.
     */
    skip?: number
    distinct?: GraphNodeScalarFieldEnum | GraphNodeScalarFieldEnum[]
  }

  /**
   * GraphNode create
   */
  export type GraphNodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * The data needed to create a GraphNode.
     */
    data: XOR<GraphNodeCreateInput, GraphNodeUncheckedCreateInput>
  }

  /**
   * GraphNode createMany
   */
  export type GraphNodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GraphNodes.
     */
    data: GraphNodeCreateManyInput | GraphNodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GraphNode createManyAndReturn
   */
  export type GraphNodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GraphNodes.
     */
    data: GraphNodeCreateManyInput | GraphNodeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GraphNode update
   */
  export type GraphNodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * The data needed to update a GraphNode.
     */
    data: XOR<GraphNodeUpdateInput, GraphNodeUncheckedUpdateInput>
    /**
     * Choose, which GraphNode to update.
     */
    where: GraphNodeWhereUniqueInput
  }

  /**
   * GraphNode updateMany
   */
  export type GraphNodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GraphNodes.
     */
    data: XOR<GraphNodeUpdateManyMutationInput, GraphNodeUncheckedUpdateManyInput>
    /**
     * Filter which GraphNodes to update
     */
    where?: GraphNodeWhereInput
  }

  /**
   * GraphNode upsert
   */
  export type GraphNodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * The filter to search for the GraphNode to update in case it exists.
     */
    where: GraphNodeWhereUniqueInput
    /**
     * In case the GraphNode found by the `where` argument doesn't exist, create a new GraphNode with this data.
     */
    create: XOR<GraphNodeCreateInput, GraphNodeUncheckedCreateInput>
    /**
     * In case the GraphNode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GraphNodeUpdateInput, GraphNodeUncheckedUpdateInput>
  }

  /**
   * GraphNode delete
   */
  export type GraphNodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
    /**
     * Filter which GraphNode to delete.
     */
    where: GraphNodeWhereUniqueInput
  }

  /**
   * GraphNode deleteMany
   */
  export type GraphNodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GraphNodes to delete
     */
    where?: GraphNodeWhereInput
  }

  /**
   * GraphNode without action
   */
  export type GraphNodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphNode
     */
    select?: GraphNodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphNodeInclude<ExtArgs> | null
  }


  /**
   * Model GraphEdge
   */

  export type AggregateGraphEdge = {
    _count: GraphEdgeCountAggregateOutputType | null
    _min: GraphEdgeMinAggregateOutputType | null
    _max: GraphEdgeMaxAggregateOutputType | null
  }

  export type GraphEdgeMinAggregateOutputType = {
    id: string | null
    graphId: string | null
    source: string | null
    target: string | null
    relation: string | null
    data: string | null
  }

  export type GraphEdgeMaxAggregateOutputType = {
    id: string | null
    graphId: string | null
    source: string | null
    target: string | null
    relation: string | null
    data: string | null
  }

  export type GraphEdgeCountAggregateOutputType = {
    id: number
    graphId: number
    source: number
    target: number
    relation: number
    data: number
    _all: number
  }


  export type GraphEdgeMinAggregateInputType = {
    id?: true
    graphId?: true
    source?: true
    target?: true
    relation?: true
    data?: true
  }

  export type GraphEdgeMaxAggregateInputType = {
    id?: true
    graphId?: true
    source?: true
    target?: true
    relation?: true
    data?: true
  }

  export type GraphEdgeCountAggregateInputType = {
    id?: true
    graphId?: true
    source?: true
    target?: true
    relation?: true
    data?: true
    _all?: true
  }

  export type GraphEdgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GraphEdge to aggregate.
     */
    where?: GraphEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphEdges to fetch.
     */
    orderBy?: GraphEdgeOrderByWithRelationInput | GraphEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GraphEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GraphEdges
    **/
    _count?: true | GraphEdgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GraphEdgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GraphEdgeMaxAggregateInputType
  }

  export type GetGraphEdgeAggregateType<T extends GraphEdgeAggregateArgs> = {
        [P in keyof T & keyof AggregateGraphEdge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGraphEdge[P]>
      : GetScalarType<T[P], AggregateGraphEdge[P]>
  }




  export type GraphEdgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraphEdgeWhereInput
    orderBy?: GraphEdgeOrderByWithAggregationInput | GraphEdgeOrderByWithAggregationInput[]
    by: GraphEdgeScalarFieldEnum[] | GraphEdgeScalarFieldEnum
    having?: GraphEdgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GraphEdgeCountAggregateInputType | true
    _min?: GraphEdgeMinAggregateInputType
    _max?: GraphEdgeMaxAggregateInputType
  }

  export type GraphEdgeGroupByOutputType = {
    id: string
    graphId: string
    source: string
    target: string
    relation: string
    data: string
    _count: GraphEdgeCountAggregateOutputType | null
    _min: GraphEdgeMinAggregateOutputType | null
    _max: GraphEdgeMaxAggregateOutputType | null
  }

  type GetGraphEdgeGroupByPayload<T extends GraphEdgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GraphEdgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GraphEdgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GraphEdgeGroupByOutputType[P]>
            : GetScalarType<T[P], GraphEdgeGroupByOutputType[P]>
        }
      >
    >


  export type GraphEdgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    graphId?: boolean
    source?: boolean
    target?: boolean
    relation?: boolean
    data?: boolean
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graphEdge"]>

  export type GraphEdgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    graphId?: boolean
    source?: boolean
    target?: boolean
    relation?: boolean
    data?: boolean
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graphEdge"]>

  export type GraphEdgeSelectScalar = {
    id?: boolean
    graphId?: boolean
    source?: boolean
    target?: boolean
    relation?: boolean
    data?: boolean
  }

  export type GraphEdgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }
  export type GraphEdgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    graph?: boolean | GraphDefaultArgs<ExtArgs>
  }

  export type $GraphEdgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GraphEdge"
    objects: {
      graph: Prisma.$GraphPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      graphId: string
      source: string
      target: string
      relation: string
      data: string
    }, ExtArgs["result"]["graphEdge"]>
    composites: {}
  }

  type GraphEdgeGetPayload<S extends boolean | null | undefined | GraphEdgeDefaultArgs> = $Result.GetResult<Prisma.$GraphEdgePayload, S>

  type GraphEdgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GraphEdgeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GraphEdgeCountAggregateInputType | true
    }

  export interface GraphEdgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GraphEdge'], meta: { name: 'GraphEdge' } }
    /**
     * Find zero or one GraphEdge that matches the filter.
     * @param {GraphEdgeFindUniqueArgs} args - Arguments to find a GraphEdge
     * @example
     * // Get one GraphEdge
     * const graphEdge = await prisma.graphEdge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GraphEdgeFindUniqueArgs>(args: SelectSubset<T, GraphEdgeFindUniqueArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GraphEdge that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GraphEdgeFindUniqueOrThrowArgs} args - Arguments to find a GraphEdge
     * @example
     * // Get one GraphEdge
     * const graphEdge = await prisma.graphEdge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GraphEdgeFindUniqueOrThrowArgs>(args: SelectSubset<T, GraphEdgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GraphEdge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeFindFirstArgs} args - Arguments to find a GraphEdge
     * @example
     * // Get one GraphEdge
     * const graphEdge = await prisma.graphEdge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GraphEdgeFindFirstArgs>(args?: SelectSubset<T, GraphEdgeFindFirstArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GraphEdge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeFindFirstOrThrowArgs} args - Arguments to find a GraphEdge
     * @example
     * // Get one GraphEdge
     * const graphEdge = await prisma.graphEdge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GraphEdgeFindFirstOrThrowArgs>(args?: SelectSubset<T, GraphEdgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GraphEdges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GraphEdges
     * const graphEdges = await prisma.graphEdge.findMany()
     * 
     * // Get first 10 GraphEdges
     * const graphEdges = await prisma.graphEdge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const graphEdgeWithIdOnly = await prisma.graphEdge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GraphEdgeFindManyArgs>(args?: SelectSubset<T, GraphEdgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GraphEdge.
     * @param {GraphEdgeCreateArgs} args - Arguments to create a GraphEdge.
     * @example
     * // Create one GraphEdge
     * const GraphEdge = await prisma.graphEdge.create({
     *   data: {
     *     // ... data to create a GraphEdge
     *   }
     * })
     * 
     */
    create<T extends GraphEdgeCreateArgs>(args: SelectSubset<T, GraphEdgeCreateArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GraphEdges.
     * @param {GraphEdgeCreateManyArgs} args - Arguments to create many GraphEdges.
     * @example
     * // Create many GraphEdges
     * const graphEdge = await prisma.graphEdge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GraphEdgeCreateManyArgs>(args?: SelectSubset<T, GraphEdgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GraphEdges and returns the data saved in the database.
     * @param {GraphEdgeCreateManyAndReturnArgs} args - Arguments to create many GraphEdges.
     * @example
     * // Create many GraphEdges
     * const graphEdge = await prisma.graphEdge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GraphEdges and only return the `id`
     * const graphEdgeWithIdOnly = await prisma.graphEdge.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GraphEdgeCreateManyAndReturnArgs>(args?: SelectSubset<T, GraphEdgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GraphEdge.
     * @param {GraphEdgeDeleteArgs} args - Arguments to delete one GraphEdge.
     * @example
     * // Delete one GraphEdge
     * const GraphEdge = await prisma.graphEdge.delete({
     *   where: {
     *     // ... filter to delete one GraphEdge
     *   }
     * })
     * 
     */
    delete<T extends GraphEdgeDeleteArgs>(args: SelectSubset<T, GraphEdgeDeleteArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GraphEdge.
     * @param {GraphEdgeUpdateArgs} args - Arguments to update one GraphEdge.
     * @example
     * // Update one GraphEdge
     * const graphEdge = await prisma.graphEdge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GraphEdgeUpdateArgs>(args: SelectSubset<T, GraphEdgeUpdateArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GraphEdges.
     * @param {GraphEdgeDeleteManyArgs} args - Arguments to filter GraphEdges to delete.
     * @example
     * // Delete a few GraphEdges
     * const { count } = await prisma.graphEdge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GraphEdgeDeleteManyArgs>(args?: SelectSubset<T, GraphEdgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GraphEdges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GraphEdges
     * const graphEdge = await prisma.graphEdge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GraphEdgeUpdateManyArgs>(args: SelectSubset<T, GraphEdgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GraphEdge.
     * @param {GraphEdgeUpsertArgs} args - Arguments to update or create a GraphEdge.
     * @example
     * // Update or create a GraphEdge
     * const graphEdge = await prisma.graphEdge.upsert({
     *   create: {
     *     // ... data to create a GraphEdge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GraphEdge we want to update
     *   }
     * })
     */
    upsert<T extends GraphEdgeUpsertArgs>(args: SelectSubset<T, GraphEdgeUpsertArgs<ExtArgs>>): Prisma__GraphEdgeClient<$Result.GetResult<Prisma.$GraphEdgePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GraphEdges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeCountArgs} args - Arguments to filter GraphEdges to count.
     * @example
     * // Count the number of GraphEdges
     * const count = await prisma.graphEdge.count({
     *   where: {
     *     // ... the filter for the GraphEdges we want to count
     *   }
     * })
    **/
    count<T extends GraphEdgeCountArgs>(
      args?: Subset<T, GraphEdgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GraphEdgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GraphEdge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GraphEdgeAggregateArgs>(args: Subset<T, GraphEdgeAggregateArgs>): Prisma.PrismaPromise<GetGraphEdgeAggregateType<T>>

    /**
     * Group by GraphEdge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraphEdgeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GraphEdgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GraphEdgeGroupByArgs['orderBy'] }
        : { orderBy?: GraphEdgeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GraphEdgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGraphEdgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GraphEdge model
   */
  readonly fields: GraphEdgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GraphEdge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GraphEdgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    graph<T extends GraphDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GraphDefaultArgs<ExtArgs>>): Prisma__GraphClient<$Result.GetResult<Prisma.$GraphPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GraphEdge model
   */ 
  interface GraphEdgeFieldRefs {
    readonly id: FieldRef<"GraphEdge", 'String'>
    readonly graphId: FieldRef<"GraphEdge", 'String'>
    readonly source: FieldRef<"GraphEdge", 'String'>
    readonly target: FieldRef<"GraphEdge", 'String'>
    readonly relation: FieldRef<"GraphEdge", 'String'>
    readonly data: FieldRef<"GraphEdge", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GraphEdge findUnique
   */
  export type GraphEdgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * Filter, which GraphEdge to fetch.
     */
    where: GraphEdgeWhereUniqueInput
  }

  /**
   * GraphEdge findUniqueOrThrow
   */
  export type GraphEdgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * Filter, which GraphEdge to fetch.
     */
    where: GraphEdgeWhereUniqueInput
  }

  /**
   * GraphEdge findFirst
   */
  export type GraphEdgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * Filter, which GraphEdge to fetch.
     */
    where?: GraphEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphEdges to fetch.
     */
    orderBy?: GraphEdgeOrderByWithRelationInput | GraphEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GraphEdges.
     */
    cursor?: GraphEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GraphEdges.
     */
    distinct?: GraphEdgeScalarFieldEnum | GraphEdgeScalarFieldEnum[]
  }

  /**
   * GraphEdge findFirstOrThrow
   */
  export type GraphEdgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * Filter, which GraphEdge to fetch.
     */
    where?: GraphEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphEdges to fetch.
     */
    orderBy?: GraphEdgeOrderByWithRelationInput | GraphEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GraphEdges.
     */
    cursor?: GraphEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GraphEdges.
     */
    distinct?: GraphEdgeScalarFieldEnum | GraphEdgeScalarFieldEnum[]
  }

  /**
   * GraphEdge findMany
   */
  export type GraphEdgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * Filter, which GraphEdges to fetch.
     */
    where?: GraphEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraphEdges to fetch.
     */
    orderBy?: GraphEdgeOrderByWithRelationInput | GraphEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GraphEdges.
     */
    cursor?: GraphEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraphEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraphEdges.
     */
    skip?: number
    distinct?: GraphEdgeScalarFieldEnum | GraphEdgeScalarFieldEnum[]
  }

  /**
   * GraphEdge create
   */
  export type GraphEdgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * The data needed to create a GraphEdge.
     */
    data: XOR<GraphEdgeCreateInput, GraphEdgeUncheckedCreateInput>
  }

  /**
   * GraphEdge createMany
   */
  export type GraphEdgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GraphEdges.
     */
    data: GraphEdgeCreateManyInput | GraphEdgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GraphEdge createManyAndReturn
   */
  export type GraphEdgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GraphEdges.
     */
    data: GraphEdgeCreateManyInput | GraphEdgeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GraphEdge update
   */
  export type GraphEdgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * The data needed to update a GraphEdge.
     */
    data: XOR<GraphEdgeUpdateInput, GraphEdgeUncheckedUpdateInput>
    /**
     * Choose, which GraphEdge to update.
     */
    where: GraphEdgeWhereUniqueInput
  }

  /**
   * GraphEdge updateMany
   */
  export type GraphEdgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GraphEdges.
     */
    data: XOR<GraphEdgeUpdateManyMutationInput, GraphEdgeUncheckedUpdateManyInput>
    /**
     * Filter which GraphEdges to update
     */
    where?: GraphEdgeWhereInput
  }

  /**
   * GraphEdge upsert
   */
  export type GraphEdgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * The filter to search for the GraphEdge to update in case it exists.
     */
    where: GraphEdgeWhereUniqueInput
    /**
     * In case the GraphEdge found by the `where` argument doesn't exist, create a new GraphEdge with this data.
     */
    create: XOR<GraphEdgeCreateInput, GraphEdgeUncheckedCreateInput>
    /**
     * In case the GraphEdge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GraphEdgeUpdateInput, GraphEdgeUncheckedUpdateInput>
  }

  /**
   * GraphEdge delete
   */
  export type GraphEdgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
    /**
     * Filter which GraphEdge to delete.
     */
    where: GraphEdgeWhereUniqueInput
  }

  /**
   * GraphEdge deleteMany
   */
  export type GraphEdgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GraphEdges to delete
     */
    where?: GraphEdgeWhereInput
  }

  /**
   * GraphEdge without action
   */
  export type GraphEdgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraphEdge
     */
    select?: GraphEdgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraphEdgeInclude<ExtArgs> | null
  }


  /**
   * Model SystemConfig
   */

  export type AggregateSystemConfig = {
    _count: SystemConfigCountAggregateOutputType | null
    _min: SystemConfigMinAggregateOutputType | null
    _max: SystemConfigMaxAggregateOutputType | null
  }

  export type SystemConfigMinAggregateOutputType = {
    id: string | null
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type SystemConfigMaxAggregateOutputType = {
    id: string | null
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type SystemConfigCountAggregateOutputType = {
    id: number
    key: number
    value: number
    updatedAt: number
    _all: number
  }


  export type SystemConfigMinAggregateInputType = {
    id?: true
    key?: true
    value?: true
    updatedAt?: true
  }

  export type SystemConfigMaxAggregateInputType = {
    id?: true
    key?: true
    value?: true
    updatedAt?: true
  }

  export type SystemConfigCountAggregateInputType = {
    id?: true
    key?: true
    value?: true
    updatedAt?: true
    _all?: true
  }

  export type SystemConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemConfig to aggregate.
     */
    where?: SystemConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemConfigs to fetch.
     */
    orderBy?: SystemConfigOrderByWithRelationInput | SystemConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemConfigs
    **/
    _count?: true | SystemConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemConfigMaxAggregateInputType
  }

  export type GetSystemConfigAggregateType<T extends SystemConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemConfig[P]>
      : GetScalarType<T[P], AggregateSystemConfig[P]>
  }




  export type SystemConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemConfigWhereInput
    orderBy?: SystemConfigOrderByWithAggregationInput | SystemConfigOrderByWithAggregationInput[]
    by: SystemConfigScalarFieldEnum[] | SystemConfigScalarFieldEnum
    having?: SystemConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemConfigCountAggregateInputType | true
    _min?: SystemConfigMinAggregateInputType
    _max?: SystemConfigMaxAggregateInputType
  }

  export type SystemConfigGroupByOutputType = {
    id: string
    key: string
    value: string
    updatedAt: Date
    _count: SystemConfigCountAggregateOutputType | null
    _min: SystemConfigMinAggregateOutputType | null
    _max: SystemConfigMaxAggregateOutputType | null
  }

  type GetSystemConfigGroupByPayload<T extends SystemConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemConfigGroupByOutputType[P]>
            : GetScalarType<T[P], SystemConfigGroupByOutputType[P]>
        }
      >
    >


  export type SystemConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemConfig"]>

  export type SystemConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemConfig"]>

  export type SystemConfigSelectScalar = {
    id?: boolean
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }


  export type $SystemConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      value: string
      updatedAt: Date
    }, ExtArgs["result"]["systemConfig"]>
    composites: {}
  }

  type SystemConfigGetPayload<S extends boolean | null | undefined | SystemConfigDefaultArgs> = $Result.GetResult<Prisma.$SystemConfigPayload, S>

  type SystemConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SystemConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SystemConfigCountAggregateInputType | true
    }

  export interface SystemConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemConfig'], meta: { name: 'SystemConfig' } }
    /**
     * Find zero or one SystemConfig that matches the filter.
     * @param {SystemConfigFindUniqueArgs} args - Arguments to find a SystemConfig
     * @example
     * // Get one SystemConfig
     * const systemConfig = await prisma.systemConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemConfigFindUniqueArgs>(args: SelectSubset<T, SystemConfigFindUniqueArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SystemConfig that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SystemConfigFindUniqueOrThrowArgs} args - Arguments to find a SystemConfig
     * @example
     * // Get one SystemConfig
     * const systemConfig = await prisma.systemConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SystemConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigFindFirstArgs} args - Arguments to find a SystemConfig
     * @example
     * // Get one SystemConfig
     * const systemConfig = await prisma.systemConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemConfigFindFirstArgs>(args?: SelectSubset<T, SystemConfigFindFirstArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SystemConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigFindFirstOrThrowArgs} args - Arguments to find a SystemConfig
     * @example
     * // Get one SystemConfig
     * const systemConfig = await prisma.systemConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SystemConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemConfigs
     * const systemConfigs = await prisma.systemConfig.findMany()
     * 
     * // Get first 10 SystemConfigs
     * const systemConfigs = await prisma.systemConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemConfigWithIdOnly = await prisma.systemConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemConfigFindManyArgs>(args?: SelectSubset<T, SystemConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SystemConfig.
     * @param {SystemConfigCreateArgs} args - Arguments to create a SystemConfig.
     * @example
     * // Create one SystemConfig
     * const SystemConfig = await prisma.systemConfig.create({
     *   data: {
     *     // ... data to create a SystemConfig
     *   }
     * })
     * 
     */
    create<T extends SystemConfigCreateArgs>(args: SelectSubset<T, SystemConfigCreateArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SystemConfigs.
     * @param {SystemConfigCreateManyArgs} args - Arguments to create many SystemConfigs.
     * @example
     * // Create many SystemConfigs
     * const systemConfig = await prisma.systemConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemConfigCreateManyArgs>(args?: SelectSubset<T, SystemConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemConfigs and returns the data saved in the database.
     * @param {SystemConfigCreateManyAndReturnArgs} args - Arguments to create many SystemConfigs.
     * @example
     * // Create many SystemConfigs
     * const systemConfig = await prisma.systemConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemConfigs and only return the `id`
     * const systemConfigWithIdOnly = await prisma.systemConfig.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SystemConfig.
     * @param {SystemConfigDeleteArgs} args - Arguments to delete one SystemConfig.
     * @example
     * // Delete one SystemConfig
     * const SystemConfig = await prisma.systemConfig.delete({
     *   where: {
     *     // ... filter to delete one SystemConfig
     *   }
     * })
     * 
     */
    delete<T extends SystemConfigDeleteArgs>(args: SelectSubset<T, SystemConfigDeleteArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SystemConfig.
     * @param {SystemConfigUpdateArgs} args - Arguments to update one SystemConfig.
     * @example
     * // Update one SystemConfig
     * const systemConfig = await prisma.systemConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemConfigUpdateArgs>(args: SelectSubset<T, SystemConfigUpdateArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SystemConfigs.
     * @param {SystemConfigDeleteManyArgs} args - Arguments to filter SystemConfigs to delete.
     * @example
     * // Delete a few SystemConfigs
     * const { count } = await prisma.systemConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemConfigDeleteManyArgs>(args?: SelectSubset<T, SystemConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemConfigs
     * const systemConfig = await prisma.systemConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemConfigUpdateManyArgs>(args: SelectSubset<T, SystemConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SystemConfig.
     * @param {SystemConfigUpsertArgs} args - Arguments to update or create a SystemConfig.
     * @example
     * // Update or create a SystemConfig
     * const systemConfig = await prisma.systemConfig.upsert({
     *   create: {
     *     // ... data to create a SystemConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemConfig we want to update
     *   }
     * })
     */
    upsert<T extends SystemConfigUpsertArgs>(args: SelectSubset<T, SystemConfigUpsertArgs<ExtArgs>>): Prisma__SystemConfigClient<$Result.GetResult<Prisma.$SystemConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SystemConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigCountArgs} args - Arguments to filter SystemConfigs to count.
     * @example
     * // Count the number of SystemConfigs
     * const count = await prisma.systemConfig.count({
     *   where: {
     *     // ... the filter for the SystemConfigs we want to count
     *   }
     * })
    **/
    count<T extends SystemConfigCountArgs>(
      args?: Subset<T, SystemConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemConfigAggregateArgs>(args: Subset<T, SystemConfigAggregateArgs>): Prisma.PrismaPromise<GetSystemConfigAggregateType<T>>

    /**
     * Group by SystemConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemConfigGroupByArgs['orderBy'] }
        : { orderBy?: SystemConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemConfig model
   */
  readonly fields: SystemConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemConfig model
   */ 
  interface SystemConfigFieldRefs {
    readonly id: FieldRef<"SystemConfig", 'String'>
    readonly key: FieldRef<"SystemConfig", 'String'>
    readonly value: FieldRef<"SystemConfig", 'String'>
    readonly updatedAt: FieldRef<"SystemConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SystemConfig findUnique
   */
  export type SystemConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * Filter, which SystemConfig to fetch.
     */
    where: SystemConfigWhereUniqueInput
  }

  /**
   * SystemConfig findUniqueOrThrow
   */
  export type SystemConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * Filter, which SystemConfig to fetch.
     */
    where: SystemConfigWhereUniqueInput
  }

  /**
   * SystemConfig findFirst
   */
  export type SystemConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * Filter, which SystemConfig to fetch.
     */
    where?: SystemConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemConfigs to fetch.
     */
    orderBy?: SystemConfigOrderByWithRelationInput | SystemConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemConfigs.
     */
    cursor?: SystemConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemConfigs.
     */
    distinct?: SystemConfigScalarFieldEnum | SystemConfigScalarFieldEnum[]
  }

  /**
   * SystemConfig findFirstOrThrow
   */
  export type SystemConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * Filter, which SystemConfig to fetch.
     */
    where?: SystemConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemConfigs to fetch.
     */
    orderBy?: SystemConfigOrderByWithRelationInput | SystemConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemConfigs.
     */
    cursor?: SystemConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemConfigs.
     */
    distinct?: SystemConfigScalarFieldEnum | SystemConfigScalarFieldEnum[]
  }

  /**
   * SystemConfig findMany
   */
  export type SystemConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * Filter, which SystemConfigs to fetch.
     */
    where?: SystemConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemConfigs to fetch.
     */
    orderBy?: SystemConfigOrderByWithRelationInput | SystemConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemConfigs.
     */
    cursor?: SystemConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemConfigs.
     */
    skip?: number
    distinct?: SystemConfigScalarFieldEnum | SystemConfigScalarFieldEnum[]
  }

  /**
   * SystemConfig create
   */
  export type SystemConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * The data needed to create a SystemConfig.
     */
    data: XOR<SystemConfigCreateInput, SystemConfigUncheckedCreateInput>
  }

  /**
   * SystemConfig createMany
   */
  export type SystemConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemConfigs.
     */
    data: SystemConfigCreateManyInput | SystemConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemConfig createManyAndReturn
   */
  export type SystemConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SystemConfigs.
     */
    data: SystemConfigCreateManyInput | SystemConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemConfig update
   */
  export type SystemConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * The data needed to update a SystemConfig.
     */
    data: XOR<SystemConfigUpdateInput, SystemConfigUncheckedUpdateInput>
    /**
     * Choose, which SystemConfig to update.
     */
    where: SystemConfigWhereUniqueInput
  }

  /**
   * SystemConfig updateMany
   */
  export type SystemConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemConfigs.
     */
    data: XOR<SystemConfigUpdateManyMutationInput, SystemConfigUncheckedUpdateManyInput>
    /**
     * Filter which SystemConfigs to update
     */
    where?: SystemConfigWhereInput
  }

  /**
   * SystemConfig upsert
   */
  export type SystemConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * The filter to search for the SystemConfig to update in case it exists.
     */
    where: SystemConfigWhereUniqueInput
    /**
     * In case the SystemConfig found by the `where` argument doesn't exist, create a new SystemConfig with this data.
     */
    create: XOR<SystemConfigCreateInput, SystemConfigUncheckedCreateInput>
    /**
     * In case the SystemConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemConfigUpdateInput, SystemConfigUncheckedUpdateInput>
  }

  /**
   * SystemConfig delete
   */
  export type SystemConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
    /**
     * Filter which SystemConfig to delete.
     */
    where: SystemConfigWhereUniqueInput
  }

  /**
   * SystemConfig deleteMany
   */
  export type SystemConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemConfigs to delete
     */
    where?: SystemConfigWhereInput
  }

  /**
   * SystemConfig without action
   */
  export type SystemConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemConfig
     */
    select?: SystemConfigSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ResearchJobScalarFieldEnum: {
    id: 'id',
    topic: 'topic',
    mode: 'mode',
    status: 'status',
    progress: 'progress',
    error: 'error',
    queries: 'queries',
    articlesFound: 'articlesFound',
    articlesProcessed: 'articlesProcessed',
    startTime: 'startTime',
    endTime: 'endTime',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    includedIds: 'includedIds',
    excludedIds: 'excludedIds',
    exclusionReasons: 'exclusionReasons',
    reviewText: 'reviewText',
    graphId: 'graphId'
  };

  export type ResearchJobScalarFieldEnum = (typeof ResearchJobScalarFieldEnum)[keyof typeof ResearchJobScalarFieldEnum]


  export const ArticleScalarFieldEnum: {
    id: 'id',
    jobId: 'jobId',
    doi: 'doi',
    title: 'title',
    authors: 'authors',
    year: 'year',
    abstract: 'abstract',
    url: 'url',
    pdfUrl: 'pdfUrl',
    source: 'source',
    status: 'status',
    screeningStatus: 'screeningStatus',
    extractedData: 'extractedData',
    entities: 'entities',
    relations: 'relations',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ArticleScalarFieldEnum = (typeof ArticleScalarFieldEnum)[keyof typeof ArticleScalarFieldEnum]


  export const GraphScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    version: 'version',
    directed: 'directed',
    nodes: 'nodes',
    edges: 'edges',
    metrics: 'metrics',
    sources: 'sources',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GraphScalarFieldEnum = (typeof GraphScalarFieldEnum)[keyof typeof GraphScalarFieldEnum]


  export const GraphNodeScalarFieldEnum: {
    id: 'id',
    graphId: 'graphId',
    label: 'label',
    name: 'name',
    data: 'data'
  };

  export type GraphNodeScalarFieldEnum = (typeof GraphNodeScalarFieldEnum)[keyof typeof GraphNodeScalarFieldEnum]


  export const GraphEdgeScalarFieldEnum: {
    id: 'id',
    graphId: 'graphId',
    source: 'source',
    target: 'target',
    relation: 'relation',
    data: 'data'
  };

  export type GraphEdgeScalarFieldEnum = (typeof GraphEdgeScalarFieldEnum)[keyof typeof GraphEdgeScalarFieldEnum]


  export const SystemConfigScalarFieldEnum: {
    id: 'id',
    key: 'key',
    value: 'value',
    updatedAt: 'updatedAt'
  };

  export type SystemConfigScalarFieldEnum = (typeof SystemConfigScalarFieldEnum)[keyof typeof SystemConfigScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ResearchJobWhereInput = {
    AND?: ResearchJobWhereInput | ResearchJobWhereInput[]
    OR?: ResearchJobWhereInput[]
    NOT?: ResearchJobWhereInput | ResearchJobWhereInput[]
    id?: StringFilter<"ResearchJob"> | string
    topic?: StringFilter<"ResearchJob"> | string
    mode?: StringFilter<"ResearchJob"> | string
    status?: StringFilter<"ResearchJob"> | string
    progress?: IntFilter<"ResearchJob"> | number
    error?: StringNullableFilter<"ResearchJob"> | string | null
    queries?: StringFilter<"ResearchJob"> | string
    articlesFound?: IntFilter<"ResearchJob"> | number
    articlesProcessed?: IntFilter<"ResearchJob"> | number
    startTime?: DateTimeNullableFilter<"ResearchJob"> | Date | string | null
    endTime?: DateTimeNullableFilter<"ResearchJob"> | Date | string | null
    createdAt?: DateTimeFilter<"ResearchJob"> | Date | string
    updatedAt?: DateTimeFilter<"ResearchJob"> | Date | string
    includedIds?: StringNullableFilter<"ResearchJob"> | string | null
    excludedIds?: StringNullableFilter<"ResearchJob"> | string | null
    exclusionReasons?: StringNullableFilter<"ResearchJob"> | string | null
    reviewText?: StringNullableFilter<"ResearchJob"> | string | null
    graphId?: StringNullableFilter<"ResearchJob"> | string | null
    articles?: ArticleListRelationFilter
    graph?: XOR<GraphNullableRelationFilter, GraphWhereInput> | null
  }

  export type ResearchJobOrderByWithRelationInput = {
    id?: SortOrder
    topic?: SortOrder
    mode?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    error?: SortOrderInput | SortOrder
    queries?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    includedIds?: SortOrderInput | SortOrder
    excludedIds?: SortOrderInput | SortOrder
    exclusionReasons?: SortOrderInput | SortOrder
    reviewText?: SortOrderInput | SortOrder
    graphId?: SortOrderInput | SortOrder
    articles?: ArticleOrderByRelationAggregateInput
    graph?: GraphOrderByWithRelationInput
  }

  export type ResearchJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ResearchJobWhereInput | ResearchJobWhereInput[]
    OR?: ResearchJobWhereInput[]
    NOT?: ResearchJobWhereInput | ResearchJobWhereInput[]
    topic?: StringFilter<"ResearchJob"> | string
    mode?: StringFilter<"ResearchJob"> | string
    status?: StringFilter<"ResearchJob"> | string
    progress?: IntFilter<"ResearchJob"> | number
    error?: StringNullableFilter<"ResearchJob"> | string | null
    queries?: StringFilter<"ResearchJob"> | string
    articlesFound?: IntFilter<"ResearchJob"> | number
    articlesProcessed?: IntFilter<"ResearchJob"> | number
    startTime?: DateTimeNullableFilter<"ResearchJob"> | Date | string | null
    endTime?: DateTimeNullableFilter<"ResearchJob"> | Date | string | null
    createdAt?: DateTimeFilter<"ResearchJob"> | Date | string
    updatedAt?: DateTimeFilter<"ResearchJob"> | Date | string
    includedIds?: StringNullableFilter<"ResearchJob"> | string | null
    excludedIds?: StringNullableFilter<"ResearchJob"> | string | null
    exclusionReasons?: StringNullableFilter<"ResearchJob"> | string | null
    reviewText?: StringNullableFilter<"ResearchJob"> | string | null
    graphId?: StringNullableFilter<"ResearchJob"> | string | null
    articles?: ArticleListRelationFilter
    graph?: XOR<GraphNullableRelationFilter, GraphWhereInput> | null
  }, "id">

  export type ResearchJobOrderByWithAggregationInput = {
    id?: SortOrder
    topic?: SortOrder
    mode?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    error?: SortOrderInput | SortOrder
    queries?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    includedIds?: SortOrderInput | SortOrder
    excludedIds?: SortOrderInput | SortOrder
    exclusionReasons?: SortOrderInput | SortOrder
    reviewText?: SortOrderInput | SortOrder
    graphId?: SortOrderInput | SortOrder
    _count?: ResearchJobCountOrderByAggregateInput
    _avg?: ResearchJobAvgOrderByAggregateInput
    _max?: ResearchJobMaxOrderByAggregateInput
    _min?: ResearchJobMinOrderByAggregateInput
    _sum?: ResearchJobSumOrderByAggregateInput
  }

  export type ResearchJobScalarWhereWithAggregatesInput = {
    AND?: ResearchJobScalarWhereWithAggregatesInput | ResearchJobScalarWhereWithAggregatesInput[]
    OR?: ResearchJobScalarWhereWithAggregatesInput[]
    NOT?: ResearchJobScalarWhereWithAggregatesInput | ResearchJobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ResearchJob"> | string
    topic?: StringWithAggregatesFilter<"ResearchJob"> | string
    mode?: StringWithAggregatesFilter<"ResearchJob"> | string
    status?: StringWithAggregatesFilter<"ResearchJob"> | string
    progress?: IntWithAggregatesFilter<"ResearchJob"> | number
    error?: StringNullableWithAggregatesFilter<"ResearchJob"> | string | null
    queries?: StringWithAggregatesFilter<"ResearchJob"> | string
    articlesFound?: IntWithAggregatesFilter<"ResearchJob"> | number
    articlesProcessed?: IntWithAggregatesFilter<"ResearchJob"> | number
    startTime?: DateTimeNullableWithAggregatesFilter<"ResearchJob"> | Date | string | null
    endTime?: DateTimeNullableWithAggregatesFilter<"ResearchJob"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ResearchJob"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ResearchJob"> | Date | string
    includedIds?: StringNullableWithAggregatesFilter<"ResearchJob"> | string | null
    excludedIds?: StringNullableWithAggregatesFilter<"ResearchJob"> | string | null
    exclusionReasons?: StringNullableWithAggregatesFilter<"ResearchJob"> | string | null
    reviewText?: StringNullableWithAggregatesFilter<"ResearchJob"> | string | null
    graphId?: StringNullableWithAggregatesFilter<"ResearchJob"> | string | null
  }

  export type ArticleWhereInput = {
    AND?: ArticleWhereInput | ArticleWhereInput[]
    OR?: ArticleWhereInput[]
    NOT?: ArticleWhereInput | ArticleWhereInput[]
    id?: StringFilter<"Article"> | string
    jobId?: StringFilter<"Article"> | string
    doi?: StringNullableFilter<"Article"> | string | null
    title?: StringFilter<"Article"> | string
    authors?: StringFilter<"Article"> | string
    year?: IntNullableFilter<"Article"> | number | null
    abstract?: StringNullableFilter<"Article"> | string | null
    url?: StringNullableFilter<"Article"> | string | null
    pdfUrl?: StringNullableFilter<"Article"> | string | null
    source?: StringFilter<"Article"> | string
    status?: StringFilter<"Article"> | string
    screeningStatus?: StringNullableFilter<"Article"> | string | null
    extractedData?: StringNullableFilter<"Article"> | string | null
    entities?: StringNullableFilter<"Article"> | string | null
    relations?: StringNullableFilter<"Article"> | string | null
    createdAt?: DateTimeFilter<"Article"> | Date | string
    updatedAt?: DateTimeFilter<"Article"> | Date | string
    job?: XOR<ResearchJobRelationFilter, ResearchJobWhereInput>
  }

  export type ArticleOrderByWithRelationInput = {
    id?: SortOrder
    jobId?: SortOrder
    doi?: SortOrderInput | SortOrder
    title?: SortOrder
    authors?: SortOrder
    year?: SortOrderInput | SortOrder
    abstract?: SortOrderInput | SortOrder
    url?: SortOrderInput | SortOrder
    pdfUrl?: SortOrderInput | SortOrder
    source?: SortOrder
    status?: SortOrder
    screeningStatus?: SortOrderInput | SortOrder
    extractedData?: SortOrderInput | SortOrder
    entities?: SortOrderInput | SortOrder
    relations?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    job?: ResearchJobOrderByWithRelationInput
  }

  export type ArticleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ArticleWhereInput | ArticleWhereInput[]
    OR?: ArticleWhereInput[]
    NOT?: ArticleWhereInput | ArticleWhereInput[]
    jobId?: StringFilter<"Article"> | string
    doi?: StringNullableFilter<"Article"> | string | null
    title?: StringFilter<"Article"> | string
    authors?: StringFilter<"Article"> | string
    year?: IntNullableFilter<"Article"> | number | null
    abstract?: StringNullableFilter<"Article"> | string | null
    url?: StringNullableFilter<"Article"> | string | null
    pdfUrl?: StringNullableFilter<"Article"> | string | null
    source?: StringFilter<"Article"> | string
    status?: StringFilter<"Article"> | string
    screeningStatus?: StringNullableFilter<"Article"> | string | null
    extractedData?: StringNullableFilter<"Article"> | string | null
    entities?: StringNullableFilter<"Article"> | string | null
    relations?: StringNullableFilter<"Article"> | string | null
    createdAt?: DateTimeFilter<"Article"> | Date | string
    updatedAt?: DateTimeFilter<"Article"> | Date | string
    job?: XOR<ResearchJobRelationFilter, ResearchJobWhereInput>
  }, "id">

  export type ArticleOrderByWithAggregationInput = {
    id?: SortOrder
    jobId?: SortOrder
    doi?: SortOrderInput | SortOrder
    title?: SortOrder
    authors?: SortOrder
    year?: SortOrderInput | SortOrder
    abstract?: SortOrderInput | SortOrder
    url?: SortOrderInput | SortOrder
    pdfUrl?: SortOrderInput | SortOrder
    source?: SortOrder
    status?: SortOrder
    screeningStatus?: SortOrderInput | SortOrder
    extractedData?: SortOrderInput | SortOrder
    entities?: SortOrderInput | SortOrder
    relations?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ArticleCountOrderByAggregateInput
    _avg?: ArticleAvgOrderByAggregateInput
    _max?: ArticleMaxOrderByAggregateInput
    _min?: ArticleMinOrderByAggregateInput
    _sum?: ArticleSumOrderByAggregateInput
  }

  export type ArticleScalarWhereWithAggregatesInput = {
    AND?: ArticleScalarWhereWithAggregatesInput | ArticleScalarWhereWithAggregatesInput[]
    OR?: ArticleScalarWhereWithAggregatesInput[]
    NOT?: ArticleScalarWhereWithAggregatesInput | ArticleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Article"> | string
    jobId?: StringWithAggregatesFilter<"Article"> | string
    doi?: StringNullableWithAggregatesFilter<"Article"> | string | null
    title?: StringWithAggregatesFilter<"Article"> | string
    authors?: StringWithAggregatesFilter<"Article"> | string
    year?: IntNullableWithAggregatesFilter<"Article"> | number | null
    abstract?: StringNullableWithAggregatesFilter<"Article"> | string | null
    url?: StringNullableWithAggregatesFilter<"Article"> | string | null
    pdfUrl?: StringNullableWithAggregatesFilter<"Article"> | string | null
    source?: StringWithAggregatesFilter<"Article"> | string
    status?: StringWithAggregatesFilter<"Article"> | string
    screeningStatus?: StringNullableWithAggregatesFilter<"Article"> | string | null
    extractedData?: StringNullableWithAggregatesFilter<"Article"> | string | null
    entities?: StringNullableWithAggregatesFilter<"Article"> | string | null
    relations?: StringNullableWithAggregatesFilter<"Article"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Article"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Article"> | Date | string
  }

  export type GraphWhereInput = {
    AND?: GraphWhereInput | GraphWhereInput[]
    OR?: GraphWhereInput[]
    NOT?: GraphWhereInput | GraphWhereInput[]
    id?: StringFilter<"Graph"> | string
    name?: StringFilter<"Graph"> | string
    description?: StringNullableFilter<"Graph"> | string | null
    version?: StringFilter<"Graph"> | string
    directed?: BoolFilter<"Graph"> | boolean
    nodes?: StringFilter<"Graph"> | string
    edges?: StringFilter<"Graph"> | string
    metrics?: StringNullableFilter<"Graph"> | string | null
    sources?: StringNullableFilter<"Graph"> | string | null
    metadata?: StringNullableFilter<"Graph"> | string | null
    createdAt?: DateTimeFilter<"Graph"> | Date | string
    updatedAt?: DateTimeFilter<"Graph"> | Date | string
    jobs?: ResearchJobListRelationFilter
    detailedNodes?: GraphNodeListRelationFilter
    detailedEdges?: GraphEdgeListRelationFilter
  }

  export type GraphOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    version?: SortOrder
    directed?: SortOrder
    nodes?: SortOrder
    edges?: SortOrder
    metrics?: SortOrderInput | SortOrder
    sources?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    jobs?: ResearchJobOrderByRelationAggregateInput
    detailedNodes?: GraphNodeOrderByRelationAggregateInput
    detailedEdges?: GraphEdgeOrderByRelationAggregateInput
  }

  export type GraphWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GraphWhereInput | GraphWhereInput[]
    OR?: GraphWhereInput[]
    NOT?: GraphWhereInput | GraphWhereInput[]
    name?: StringFilter<"Graph"> | string
    description?: StringNullableFilter<"Graph"> | string | null
    version?: StringFilter<"Graph"> | string
    directed?: BoolFilter<"Graph"> | boolean
    nodes?: StringFilter<"Graph"> | string
    edges?: StringFilter<"Graph"> | string
    metrics?: StringNullableFilter<"Graph"> | string | null
    sources?: StringNullableFilter<"Graph"> | string | null
    metadata?: StringNullableFilter<"Graph"> | string | null
    createdAt?: DateTimeFilter<"Graph"> | Date | string
    updatedAt?: DateTimeFilter<"Graph"> | Date | string
    jobs?: ResearchJobListRelationFilter
    detailedNodes?: GraphNodeListRelationFilter
    detailedEdges?: GraphEdgeListRelationFilter
  }, "id">

  export type GraphOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    version?: SortOrder
    directed?: SortOrder
    nodes?: SortOrder
    edges?: SortOrder
    metrics?: SortOrderInput | SortOrder
    sources?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GraphCountOrderByAggregateInput
    _max?: GraphMaxOrderByAggregateInput
    _min?: GraphMinOrderByAggregateInput
  }

  export type GraphScalarWhereWithAggregatesInput = {
    AND?: GraphScalarWhereWithAggregatesInput | GraphScalarWhereWithAggregatesInput[]
    OR?: GraphScalarWhereWithAggregatesInput[]
    NOT?: GraphScalarWhereWithAggregatesInput | GraphScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Graph"> | string
    name?: StringWithAggregatesFilter<"Graph"> | string
    description?: StringNullableWithAggregatesFilter<"Graph"> | string | null
    version?: StringWithAggregatesFilter<"Graph"> | string
    directed?: BoolWithAggregatesFilter<"Graph"> | boolean
    nodes?: StringWithAggregatesFilter<"Graph"> | string
    edges?: StringWithAggregatesFilter<"Graph"> | string
    metrics?: StringNullableWithAggregatesFilter<"Graph"> | string | null
    sources?: StringNullableWithAggregatesFilter<"Graph"> | string | null
    metadata?: StringNullableWithAggregatesFilter<"Graph"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Graph"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Graph"> | Date | string
  }

  export type GraphNodeWhereInput = {
    AND?: GraphNodeWhereInput | GraphNodeWhereInput[]
    OR?: GraphNodeWhereInput[]
    NOT?: GraphNodeWhereInput | GraphNodeWhereInput[]
    id?: StringFilter<"GraphNode"> | string
    graphId?: StringFilter<"GraphNode"> | string
    label?: StringFilter<"GraphNode"> | string
    name?: StringFilter<"GraphNode"> | string
    data?: StringFilter<"GraphNode"> | string
    graph?: XOR<GraphRelationFilter, GraphWhereInput>
  }

  export type GraphNodeOrderByWithRelationInput = {
    id?: SortOrder
    graphId?: SortOrder
    label?: SortOrder
    name?: SortOrder
    data?: SortOrder
    graph?: GraphOrderByWithRelationInput
  }

  export type GraphNodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GraphNodeWhereInput | GraphNodeWhereInput[]
    OR?: GraphNodeWhereInput[]
    NOT?: GraphNodeWhereInput | GraphNodeWhereInput[]
    graphId?: StringFilter<"GraphNode"> | string
    label?: StringFilter<"GraphNode"> | string
    name?: StringFilter<"GraphNode"> | string
    data?: StringFilter<"GraphNode"> | string
    graph?: XOR<GraphRelationFilter, GraphWhereInput>
  }, "id">

  export type GraphNodeOrderByWithAggregationInput = {
    id?: SortOrder
    graphId?: SortOrder
    label?: SortOrder
    name?: SortOrder
    data?: SortOrder
    _count?: GraphNodeCountOrderByAggregateInput
    _max?: GraphNodeMaxOrderByAggregateInput
    _min?: GraphNodeMinOrderByAggregateInput
  }

  export type GraphNodeScalarWhereWithAggregatesInput = {
    AND?: GraphNodeScalarWhereWithAggregatesInput | GraphNodeScalarWhereWithAggregatesInput[]
    OR?: GraphNodeScalarWhereWithAggregatesInput[]
    NOT?: GraphNodeScalarWhereWithAggregatesInput | GraphNodeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GraphNode"> | string
    graphId?: StringWithAggregatesFilter<"GraphNode"> | string
    label?: StringWithAggregatesFilter<"GraphNode"> | string
    name?: StringWithAggregatesFilter<"GraphNode"> | string
    data?: StringWithAggregatesFilter<"GraphNode"> | string
  }

  export type GraphEdgeWhereInput = {
    AND?: GraphEdgeWhereInput | GraphEdgeWhereInput[]
    OR?: GraphEdgeWhereInput[]
    NOT?: GraphEdgeWhereInput | GraphEdgeWhereInput[]
    id?: StringFilter<"GraphEdge"> | string
    graphId?: StringFilter<"GraphEdge"> | string
    source?: StringFilter<"GraphEdge"> | string
    target?: StringFilter<"GraphEdge"> | string
    relation?: StringFilter<"GraphEdge"> | string
    data?: StringFilter<"GraphEdge"> | string
    graph?: XOR<GraphRelationFilter, GraphWhereInput>
  }

  export type GraphEdgeOrderByWithRelationInput = {
    id?: SortOrder
    graphId?: SortOrder
    source?: SortOrder
    target?: SortOrder
    relation?: SortOrder
    data?: SortOrder
    graph?: GraphOrderByWithRelationInput
  }

  export type GraphEdgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GraphEdgeWhereInput | GraphEdgeWhereInput[]
    OR?: GraphEdgeWhereInput[]
    NOT?: GraphEdgeWhereInput | GraphEdgeWhereInput[]
    graphId?: StringFilter<"GraphEdge"> | string
    source?: StringFilter<"GraphEdge"> | string
    target?: StringFilter<"GraphEdge"> | string
    relation?: StringFilter<"GraphEdge"> | string
    data?: StringFilter<"GraphEdge"> | string
    graph?: XOR<GraphRelationFilter, GraphWhereInput>
  }, "id">

  export type GraphEdgeOrderByWithAggregationInput = {
    id?: SortOrder
    graphId?: SortOrder
    source?: SortOrder
    target?: SortOrder
    relation?: SortOrder
    data?: SortOrder
    _count?: GraphEdgeCountOrderByAggregateInput
    _max?: GraphEdgeMaxOrderByAggregateInput
    _min?: GraphEdgeMinOrderByAggregateInput
  }

  export type GraphEdgeScalarWhereWithAggregatesInput = {
    AND?: GraphEdgeScalarWhereWithAggregatesInput | GraphEdgeScalarWhereWithAggregatesInput[]
    OR?: GraphEdgeScalarWhereWithAggregatesInput[]
    NOT?: GraphEdgeScalarWhereWithAggregatesInput | GraphEdgeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GraphEdge"> | string
    graphId?: StringWithAggregatesFilter<"GraphEdge"> | string
    source?: StringWithAggregatesFilter<"GraphEdge"> | string
    target?: StringWithAggregatesFilter<"GraphEdge"> | string
    relation?: StringWithAggregatesFilter<"GraphEdge"> | string
    data?: StringWithAggregatesFilter<"GraphEdge"> | string
  }

  export type SystemConfigWhereInput = {
    AND?: SystemConfigWhereInput | SystemConfigWhereInput[]
    OR?: SystemConfigWhereInput[]
    NOT?: SystemConfigWhereInput | SystemConfigWhereInput[]
    id?: StringFilter<"SystemConfig"> | string
    key?: StringFilter<"SystemConfig"> | string
    value?: StringFilter<"SystemConfig"> | string
    updatedAt?: DateTimeFilter<"SystemConfig"> | Date | string
  }

  export type SystemConfigOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key?: string
    AND?: SystemConfigWhereInput | SystemConfigWhereInput[]
    OR?: SystemConfigWhereInput[]
    NOT?: SystemConfigWhereInput | SystemConfigWhereInput[]
    value?: StringFilter<"SystemConfig"> | string
    updatedAt?: DateTimeFilter<"SystemConfig"> | Date | string
  }, "id" | "key">

  export type SystemConfigOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
    _count?: SystemConfigCountOrderByAggregateInput
    _max?: SystemConfigMaxOrderByAggregateInput
    _min?: SystemConfigMinOrderByAggregateInput
  }

  export type SystemConfigScalarWhereWithAggregatesInput = {
    AND?: SystemConfigScalarWhereWithAggregatesInput | SystemConfigScalarWhereWithAggregatesInput[]
    OR?: SystemConfigScalarWhereWithAggregatesInput[]
    NOT?: SystemConfigScalarWhereWithAggregatesInput | SystemConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemConfig"> | string
    key?: StringWithAggregatesFilter<"SystemConfig"> | string
    value?: StringWithAggregatesFilter<"SystemConfig"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"SystemConfig"> | Date | string
  }

  export type ResearchJobCreateInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    articles?: ArticleCreateNestedManyWithoutJobInput
    graph?: GraphCreateNestedOneWithoutJobsInput
  }

  export type ResearchJobUncheckedCreateInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    graphId?: string | null
    articles?: ArticleUncheckedCreateNestedManyWithoutJobInput
  }

  export type ResearchJobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    articles?: ArticleUpdateManyWithoutJobNestedInput
    graph?: GraphUpdateOneWithoutJobsNestedInput
  }

  export type ResearchJobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    graphId?: NullableStringFieldUpdateOperationsInput | string | null
    articles?: ArticleUncheckedUpdateManyWithoutJobNestedInput
  }

  export type ResearchJobCreateManyInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    graphId?: string | null
  }

  export type ResearchJobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ResearchJobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    graphId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ArticleCreateInput = {
    id: string
    doi?: string | null
    title: string
    authors: string
    year?: number | null
    abstract?: string | null
    url?: string | null
    pdfUrl?: string | null
    source: string
    status: string
    screeningStatus?: string | null
    extractedData?: string | null
    entities?: string | null
    relations?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    job: ResearchJobCreateNestedOneWithoutArticlesInput
  }

  export type ArticleUncheckedCreateInput = {
    id: string
    jobId: string
    doi?: string | null
    title: string
    authors: string
    year?: number | null
    abstract?: string | null
    url?: string | null
    pdfUrl?: string | null
    source: string
    status: string
    screeningStatus?: string | null
    extractedData?: string | null
    entities?: string | null
    relations?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArticleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    job?: ResearchJobUpdateOneRequiredWithoutArticlesNestedInput
  }

  export type ArticleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArticleCreateManyInput = {
    id: string
    jobId: string
    doi?: string | null
    title: string
    authors: string
    year?: number | null
    abstract?: string | null
    url?: string | null
    pdfUrl?: string | null
    source: string
    status: string
    screeningStatus?: string | null
    extractedData?: string | null
    entities?: string | null
    relations?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArticleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArticleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraphCreateInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jobs?: ResearchJobCreateNestedManyWithoutGraphInput
    detailedNodes?: GraphNodeCreateNestedManyWithoutGraphInput
    detailedEdges?: GraphEdgeCreateNestedManyWithoutGraphInput
  }

  export type GraphUncheckedCreateInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jobs?: ResearchJobUncheckedCreateNestedManyWithoutGraphInput
    detailedNodes?: GraphNodeUncheckedCreateNestedManyWithoutGraphInput
    detailedEdges?: GraphEdgeUncheckedCreateNestedManyWithoutGraphInput
  }

  export type GraphUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobs?: ResearchJobUpdateManyWithoutGraphNestedInput
    detailedNodes?: GraphNodeUpdateManyWithoutGraphNestedInput
    detailedEdges?: GraphEdgeUpdateManyWithoutGraphNestedInput
  }

  export type GraphUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobs?: ResearchJobUncheckedUpdateManyWithoutGraphNestedInput
    detailedNodes?: GraphNodeUncheckedUpdateManyWithoutGraphNestedInput
    detailedEdges?: GraphEdgeUncheckedUpdateManyWithoutGraphNestedInput
  }

  export type GraphCreateManyInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GraphUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraphUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraphNodeCreateInput = {
    id?: string
    label: string
    name: string
    data: string
    graph: GraphCreateNestedOneWithoutDetailedNodesInput
  }

  export type GraphNodeUncheckedCreateInput = {
    id?: string
    graphId: string
    label: string
    name: string
    data: string
  }

  export type GraphNodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    graph?: GraphUpdateOneRequiredWithoutDetailedNodesNestedInput
  }

  export type GraphNodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    graphId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphNodeCreateManyInput = {
    id?: string
    graphId: string
    label: string
    name: string
    data: string
  }

  export type GraphNodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphNodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    graphId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphEdgeCreateInput = {
    id?: string
    source: string
    target: string
    relation: string
    data: string
    graph: GraphCreateNestedOneWithoutDetailedEdgesInput
  }

  export type GraphEdgeUncheckedCreateInput = {
    id?: string
    graphId: string
    source: string
    target: string
    relation: string
    data: string
  }

  export type GraphEdgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    graph?: GraphUpdateOneRequiredWithoutDetailedEdgesNestedInput
  }

  export type GraphEdgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    graphId?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphEdgeCreateManyInput = {
    id?: string
    graphId: string
    source: string
    target: string
    relation: string
    data: string
  }

  export type GraphEdgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphEdgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    graphId?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type SystemConfigCreateInput = {
    id?: string
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type SystemConfigUncheckedCreateInput = {
    id?: string
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type SystemConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemConfigCreateManyInput = {
    id?: string
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type SystemConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ArticleListRelationFilter = {
    every?: ArticleWhereInput
    some?: ArticleWhereInput
    none?: ArticleWhereInput
  }

  export type GraphNullableRelationFilter = {
    is?: GraphWhereInput | null
    isNot?: GraphWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ArticleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ResearchJobCountOrderByAggregateInput = {
    id?: SortOrder
    topic?: SortOrder
    mode?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    error?: SortOrder
    queries?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    includedIds?: SortOrder
    excludedIds?: SortOrder
    exclusionReasons?: SortOrder
    reviewText?: SortOrder
    graphId?: SortOrder
  }

  export type ResearchJobAvgOrderByAggregateInput = {
    progress?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
  }

  export type ResearchJobMaxOrderByAggregateInput = {
    id?: SortOrder
    topic?: SortOrder
    mode?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    error?: SortOrder
    queries?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    includedIds?: SortOrder
    excludedIds?: SortOrder
    exclusionReasons?: SortOrder
    reviewText?: SortOrder
    graphId?: SortOrder
  }

  export type ResearchJobMinOrderByAggregateInput = {
    id?: SortOrder
    topic?: SortOrder
    mode?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    error?: SortOrder
    queries?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    includedIds?: SortOrder
    excludedIds?: SortOrder
    exclusionReasons?: SortOrder
    reviewText?: SortOrder
    graphId?: SortOrder
  }

  export type ResearchJobSumOrderByAggregateInput = {
    progress?: SortOrder
    articlesFound?: SortOrder
    articlesProcessed?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ResearchJobRelationFilter = {
    is?: ResearchJobWhereInput
    isNot?: ResearchJobWhereInput
  }

  export type ArticleCountOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    doi?: SortOrder
    title?: SortOrder
    authors?: SortOrder
    year?: SortOrder
    abstract?: SortOrder
    url?: SortOrder
    pdfUrl?: SortOrder
    source?: SortOrder
    status?: SortOrder
    screeningStatus?: SortOrder
    extractedData?: SortOrder
    entities?: SortOrder
    relations?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArticleAvgOrderByAggregateInput = {
    year?: SortOrder
  }

  export type ArticleMaxOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    doi?: SortOrder
    title?: SortOrder
    authors?: SortOrder
    year?: SortOrder
    abstract?: SortOrder
    url?: SortOrder
    pdfUrl?: SortOrder
    source?: SortOrder
    status?: SortOrder
    screeningStatus?: SortOrder
    extractedData?: SortOrder
    entities?: SortOrder
    relations?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArticleMinOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    doi?: SortOrder
    title?: SortOrder
    authors?: SortOrder
    year?: SortOrder
    abstract?: SortOrder
    url?: SortOrder
    pdfUrl?: SortOrder
    source?: SortOrder
    status?: SortOrder
    screeningStatus?: SortOrder
    extractedData?: SortOrder
    entities?: SortOrder
    relations?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArticleSumOrderByAggregateInput = {
    year?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ResearchJobListRelationFilter = {
    every?: ResearchJobWhereInput
    some?: ResearchJobWhereInput
    none?: ResearchJobWhereInput
  }

  export type GraphNodeListRelationFilter = {
    every?: GraphNodeWhereInput
    some?: GraphNodeWhereInput
    none?: GraphNodeWhereInput
  }

  export type GraphEdgeListRelationFilter = {
    every?: GraphEdgeWhereInput
    some?: GraphEdgeWhereInput
    none?: GraphEdgeWhereInput
  }

  export type ResearchJobOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GraphNodeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GraphEdgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GraphCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    version?: SortOrder
    directed?: SortOrder
    nodes?: SortOrder
    edges?: SortOrder
    metrics?: SortOrder
    sources?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GraphMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    version?: SortOrder
    directed?: SortOrder
    nodes?: SortOrder
    edges?: SortOrder
    metrics?: SortOrder
    sources?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GraphMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    version?: SortOrder
    directed?: SortOrder
    nodes?: SortOrder
    edges?: SortOrder
    metrics?: SortOrder
    sources?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type GraphRelationFilter = {
    is?: GraphWhereInput
    isNot?: GraphWhereInput
  }

  export type GraphNodeCountOrderByAggregateInput = {
    id?: SortOrder
    graphId?: SortOrder
    label?: SortOrder
    name?: SortOrder
    data?: SortOrder
  }

  export type GraphNodeMaxOrderByAggregateInput = {
    id?: SortOrder
    graphId?: SortOrder
    label?: SortOrder
    name?: SortOrder
    data?: SortOrder
  }

  export type GraphNodeMinOrderByAggregateInput = {
    id?: SortOrder
    graphId?: SortOrder
    label?: SortOrder
    name?: SortOrder
    data?: SortOrder
  }

  export type GraphEdgeCountOrderByAggregateInput = {
    id?: SortOrder
    graphId?: SortOrder
    source?: SortOrder
    target?: SortOrder
    relation?: SortOrder
    data?: SortOrder
  }

  export type GraphEdgeMaxOrderByAggregateInput = {
    id?: SortOrder
    graphId?: SortOrder
    source?: SortOrder
    target?: SortOrder
    relation?: SortOrder
    data?: SortOrder
  }

  export type GraphEdgeMinOrderByAggregateInput = {
    id?: SortOrder
    graphId?: SortOrder
    source?: SortOrder
    target?: SortOrder
    relation?: SortOrder
    data?: SortOrder
  }

  export type SystemConfigCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemConfigMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArticleCreateNestedManyWithoutJobInput = {
    create?: XOR<ArticleCreateWithoutJobInput, ArticleUncheckedCreateWithoutJobInput> | ArticleCreateWithoutJobInput[] | ArticleUncheckedCreateWithoutJobInput[]
    connectOrCreate?: ArticleCreateOrConnectWithoutJobInput | ArticleCreateOrConnectWithoutJobInput[]
    createMany?: ArticleCreateManyJobInputEnvelope
    connect?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
  }

  export type GraphCreateNestedOneWithoutJobsInput = {
    create?: XOR<GraphCreateWithoutJobsInput, GraphUncheckedCreateWithoutJobsInput>
    connectOrCreate?: GraphCreateOrConnectWithoutJobsInput
    connect?: GraphWhereUniqueInput
  }

  export type ArticleUncheckedCreateNestedManyWithoutJobInput = {
    create?: XOR<ArticleCreateWithoutJobInput, ArticleUncheckedCreateWithoutJobInput> | ArticleCreateWithoutJobInput[] | ArticleUncheckedCreateWithoutJobInput[]
    connectOrCreate?: ArticleCreateOrConnectWithoutJobInput | ArticleCreateOrConnectWithoutJobInput[]
    createMany?: ArticleCreateManyJobInputEnvelope
    connect?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ArticleUpdateManyWithoutJobNestedInput = {
    create?: XOR<ArticleCreateWithoutJobInput, ArticleUncheckedCreateWithoutJobInput> | ArticleCreateWithoutJobInput[] | ArticleUncheckedCreateWithoutJobInput[]
    connectOrCreate?: ArticleCreateOrConnectWithoutJobInput | ArticleCreateOrConnectWithoutJobInput[]
    upsert?: ArticleUpsertWithWhereUniqueWithoutJobInput | ArticleUpsertWithWhereUniqueWithoutJobInput[]
    createMany?: ArticleCreateManyJobInputEnvelope
    set?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    disconnect?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    delete?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    connect?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    update?: ArticleUpdateWithWhereUniqueWithoutJobInput | ArticleUpdateWithWhereUniqueWithoutJobInput[]
    updateMany?: ArticleUpdateManyWithWhereWithoutJobInput | ArticleUpdateManyWithWhereWithoutJobInput[]
    deleteMany?: ArticleScalarWhereInput | ArticleScalarWhereInput[]
  }

  export type GraphUpdateOneWithoutJobsNestedInput = {
    create?: XOR<GraphCreateWithoutJobsInput, GraphUncheckedCreateWithoutJobsInput>
    connectOrCreate?: GraphCreateOrConnectWithoutJobsInput
    upsert?: GraphUpsertWithoutJobsInput
    disconnect?: GraphWhereInput | boolean
    delete?: GraphWhereInput | boolean
    connect?: GraphWhereUniqueInput
    update?: XOR<XOR<GraphUpdateToOneWithWhereWithoutJobsInput, GraphUpdateWithoutJobsInput>, GraphUncheckedUpdateWithoutJobsInput>
  }

  export type ArticleUncheckedUpdateManyWithoutJobNestedInput = {
    create?: XOR<ArticleCreateWithoutJobInput, ArticleUncheckedCreateWithoutJobInput> | ArticleCreateWithoutJobInput[] | ArticleUncheckedCreateWithoutJobInput[]
    connectOrCreate?: ArticleCreateOrConnectWithoutJobInput | ArticleCreateOrConnectWithoutJobInput[]
    upsert?: ArticleUpsertWithWhereUniqueWithoutJobInput | ArticleUpsertWithWhereUniqueWithoutJobInput[]
    createMany?: ArticleCreateManyJobInputEnvelope
    set?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    disconnect?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    delete?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    connect?: ArticleWhereUniqueInput | ArticleWhereUniqueInput[]
    update?: ArticleUpdateWithWhereUniqueWithoutJobInput | ArticleUpdateWithWhereUniqueWithoutJobInput[]
    updateMany?: ArticleUpdateManyWithWhereWithoutJobInput | ArticleUpdateManyWithWhereWithoutJobInput[]
    deleteMany?: ArticleScalarWhereInput | ArticleScalarWhereInput[]
  }

  export type ResearchJobCreateNestedOneWithoutArticlesInput = {
    create?: XOR<ResearchJobCreateWithoutArticlesInput, ResearchJobUncheckedCreateWithoutArticlesInput>
    connectOrCreate?: ResearchJobCreateOrConnectWithoutArticlesInput
    connect?: ResearchJobWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ResearchJobUpdateOneRequiredWithoutArticlesNestedInput = {
    create?: XOR<ResearchJobCreateWithoutArticlesInput, ResearchJobUncheckedCreateWithoutArticlesInput>
    connectOrCreate?: ResearchJobCreateOrConnectWithoutArticlesInput
    upsert?: ResearchJobUpsertWithoutArticlesInput
    connect?: ResearchJobWhereUniqueInput
    update?: XOR<XOR<ResearchJobUpdateToOneWithWhereWithoutArticlesInput, ResearchJobUpdateWithoutArticlesInput>, ResearchJobUncheckedUpdateWithoutArticlesInput>
  }

  export type ResearchJobCreateNestedManyWithoutGraphInput = {
    create?: XOR<ResearchJobCreateWithoutGraphInput, ResearchJobUncheckedCreateWithoutGraphInput> | ResearchJobCreateWithoutGraphInput[] | ResearchJobUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: ResearchJobCreateOrConnectWithoutGraphInput | ResearchJobCreateOrConnectWithoutGraphInput[]
    createMany?: ResearchJobCreateManyGraphInputEnvelope
    connect?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
  }

  export type GraphNodeCreateNestedManyWithoutGraphInput = {
    create?: XOR<GraphNodeCreateWithoutGraphInput, GraphNodeUncheckedCreateWithoutGraphInput> | GraphNodeCreateWithoutGraphInput[] | GraphNodeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphNodeCreateOrConnectWithoutGraphInput | GraphNodeCreateOrConnectWithoutGraphInput[]
    createMany?: GraphNodeCreateManyGraphInputEnvelope
    connect?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
  }

  export type GraphEdgeCreateNestedManyWithoutGraphInput = {
    create?: XOR<GraphEdgeCreateWithoutGraphInput, GraphEdgeUncheckedCreateWithoutGraphInput> | GraphEdgeCreateWithoutGraphInput[] | GraphEdgeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphEdgeCreateOrConnectWithoutGraphInput | GraphEdgeCreateOrConnectWithoutGraphInput[]
    createMany?: GraphEdgeCreateManyGraphInputEnvelope
    connect?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
  }

  export type ResearchJobUncheckedCreateNestedManyWithoutGraphInput = {
    create?: XOR<ResearchJobCreateWithoutGraphInput, ResearchJobUncheckedCreateWithoutGraphInput> | ResearchJobCreateWithoutGraphInput[] | ResearchJobUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: ResearchJobCreateOrConnectWithoutGraphInput | ResearchJobCreateOrConnectWithoutGraphInput[]
    createMany?: ResearchJobCreateManyGraphInputEnvelope
    connect?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
  }

  export type GraphNodeUncheckedCreateNestedManyWithoutGraphInput = {
    create?: XOR<GraphNodeCreateWithoutGraphInput, GraphNodeUncheckedCreateWithoutGraphInput> | GraphNodeCreateWithoutGraphInput[] | GraphNodeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphNodeCreateOrConnectWithoutGraphInput | GraphNodeCreateOrConnectWithoutGraphInput[]
    createMany?: GraphNodeCreateManyGraphInputEnvelope
    connect?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
  }

  export type GraphEdgeUncheckedCreateNestedManyWithoutGraphInput = {
    create?: XOR<GraphEdgeCreateWithoutGraphInput, GraphEdgeUncheckedCreateWithoutGraphInput> | GraphEdgeCreateWithoutGraphInput[] | GraphEdgeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphEdgeCreateOrConnectWithoutGraphInput | GraphEdgeCreateOrConnectWithoutGraphInput[]
    createMany?: GraphEdgeCreateManyGraphInputEnvelope
    connect?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ResearchJobUpdateManyWithoutGraphNestedInput = {
    create?: XOR<ResearchJobCreateWithoutGraphInput, ResearchJobUncheckedCreateWithoutGraphInput> | ResearchJobCreateWithoutGraphInput[] | ResearchJobUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: ResearchJobCreateOrConnectWithoutGraphInput | ResearchJobCreateOrConnectWithoutGraphInput[]
    upsert?: ResearchJobUpsertWithWhereUniqueWithoutGraphInput | ResearchJobUpsertWithWhereUniqueWithoutGraphInput[]
    createMany?: ResearchJobCreateManyGraphInputEnvelope
    set?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    disconnect?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    delete?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    connect?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    update?: ResearchJobUpdateWithWhereUniqueWithoutGraphInput | ResearchJobUpdateWithWhereUniqueWithoutGraphInput[]
    updateMany?: ResearchJobUpdateManyWithWhereWithoutGraphInput | ResearchJobUpdateManyWithWhereWithoutGraphInput[]
    deleteMany?: ResearchJobScalarWhereInput | ResearchJobScalarWhereInput[]
  }

  export type GraphNodeUpdateManyWithoutGraphNestedInput = {
    create?: XOR<GraphNodeCreateWithoutGraphInput, GraphNodeUncheckedCreateWithoutGraphInput> | GraphNodeCreateWithoutGraphInput[] | GraphNodeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphNodeCreateOrConnectWithoutGraphInput | GraphNodeCreateOrConnectWithoutGraphInput[]
    upsert?: GraphNodeUpsertWithWhereUniqueWithoutGraphInput | GraphNodeUpsertWithWhereUniqueWithoutGraphInput[]
    createMany?: GraphNodeCreateManyGraphInputEnvelope
    set?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    disconnect?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    delete?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    connect?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    update?: GraphNodeUpdateWithWhereUniqueWithoutGraphInput | GraphNodeUpdateWithWhereUniqueWithoutGraphInput[]
    updateMany?: GraphNodeUpdateManyWithWhereWithoutGraphInput | GraphNodeUpdateManyWithWhereWithoutGraphInput[]
    deleteMany?: GraphNodeScalarWhereInput | GraphNodeScalarWhereInput[]
  }

  export type GraphEdgeUpdateManyWithoutGraphNestedInput = {
    create?: XOR<GraphEdgeCreateWithoutGraphInput, GraphEdgeUncheckedCreateWithoutGraphInput> | GraphEdgeCreateWithoutGraphInput[] | GraphEdgeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphEdgeCreateOrConnectWithoutGraphInput | GraphEdgeCreateOrConnectWithoutGraphInput[]
    upsert?: GraphEdgeUpsertWithWhereUniqueWithoutGraphInput | GraphEdgeUpsertWithWhereUniqueWithoutGraphInput[]
    createMany?: GraphEdgeCreateManyGraphInputEnvelope
    set?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    disconnect?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    delete?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    connect?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    update?: GraphEdgeUpdateWithWhereUniqueWithoutGraphInput | GraphEdgeUpdateWithWhereUniqueWithoutGraphInput[]
    updateMany?: GraphEdgeUpdateManyWithWhereWithoutGraphInput | GraphEdgeUpdateManyWithWhereWithoutGraphInput[]
    deleteMany?: GraphEdgeScalarWhereInput | GraphEdgeScalarWhereInput[]
  }

  export type ResearchJobUncheckedUpdateManyWithoutGraphNestedInput = {
    create?: XOR<ResearchJobCreateWithoutGraphInput, ResearchJobUncheckedCreateWithoutGraphInput> | ResearchJobCreateWithoutGraphInput[] | ResearchJobUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: ResearchJobCreateOrConnectWithoutGraphInput | ResearchJobCreateOrConnectWithoutGraphInput[]
    upsert?: ResearchJobUpsertWithWhereUniqueWithoutGraphInput | ResearchJobUpsertWithWhereUniqueWithoutGraphInput[]
    createMany?: ResearchJobCreateManyGraphInputEnvelope
    set?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    disconnect?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    delete?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    connect?: ResearchJobWhereUniqueInput | ResearchJobWhereUniqueInput[]
    update?: ResearchJobUpdateWithWhereUniqueWithoutGraphInput | ResearchJobUpdateWithWhereUniqueWithoutGraphInput[]
    updateMany?: ResearchJobUpdateManyWithWhereWithoutGraphInput | ResearchJobUpdateManyWithWhereWithoutGraphInput[]
    deleteMany?: ResearchJobScalarWhereInput | ResearchJobScalarWhereInput[]
  }

  export type GraphNodeUncheckedUpdateManyWithoutGraphNestedInput = {
    create?: XOR<GraphNodeCreateWithoutGraphInput, GraphNodeUncheckedCreateWithoutGraphInput> | GraphNodeCreateWithoutGraphInput[] | GraphNodeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphNodeCreateOrConnectWithoutGraphInput | GraphNodeCreateOrConnectWithoutGraphInput[]
    upsert?: GraphNodeUpsertWithWhereUniqueWithoutGraphInput | GraphNodeUpsertWithWhereUniqueWithoutGraphInput[]
    createMany?: GraphNodeCreateManyGraphInputEnvelope
    set?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    disconnect?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    delete?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    connect?: GraphNodeWhereUniqueInput | GraphNodeWhereUniqueInput[]
    update?: GraphNodeUpdateWithWhereUniqueWithoutGraphInput | GraphNodeUpdateWithWhereUniqueWithoutGraphInput[]
    updateMany?: GraphNodeUpdateManyWithWhereWithoutGraphInput | GraphNodeUpdateManyWithWhereWithoutGraphInput[]
    deleteMany?: GraphNodeScalarWhereInput | GraphNodeScalarWhereInput[]
  }

  export type GraphEdgeUncheckedUpdateManyWithoutGraphNestedInput = {
    create?: XOR<GraphEdgeCreateWithoutGraphInput, GraphEdgeUncheckedCreateWithoutGraphInput> | GraphEdgeCreateWithoutGraphInput[] | GraphEdgeUncheckedCreateWithoutGraphInput[]
    connectOrCreate?: GraphEdgeCreateOrConnectWithoutGraphInput | GraphEdgeCreateOrConnectWithoutGraphInput[]
    upsert?: GraphEdgeUpsertWithWhereUniqueWithoutGraphInput | GraphEdgeUpsertWithWhereUniqueWithoutGraphInput[]
    createMany?: GraphEdgeCreateManyGraphInputEnvelope
    set?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    disconnect?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    delete?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    connect?: GraphEdgeWhereUniqueInput | GraphEdgeWhereUniqueInput[]
    update?: GraphEdgeUpdateWithWhereUniqueWithoutGraphInput | GraphEdgeUpdateWithWhereUniqueWithoutGraphInput[]
    updateMany?: GraphEdgeUpdateManyWithWhereWithoutGraphInput | GraphEdgeUpdateManyWithWhereWithoutGraphInput[]
    deleteMany?: GraphEdgeScalarWhereInput | GraphEdgeScalarWhereInput[]
  }

  export type GraphCreateNestedOneWithoutDetailedNodesInput = {
    create?: XOR<GraphCreateWithoutDetailedNodesInput, GraphUncheckedCreateWithoutDetailedNodesInput>
    connectOrCreate?: GraphCreateOrConnectWithoutDetailedNodesInput
    connect?: GraphWhereUniqueInput
  }

  export type GraphUpdateOneRequiredWithoutDetailedNodesNestedInput = {
    create?: XOR<GraphCreateWithoutDetailedNodesInput, GraphUncheckedCreateWithoutDetailedNodesInput>
    connectOrCreate?: GraphCreateOrConnectWithoutDetailedNodesInput
    upsert?: GraphUpsertWithoutDetailedNodesInput
    connect?: GraphWhereUniqueInput
    update?: XOR<XOR<GraphUpdateToOneWithWhereWithoutDetailedNodesInput, GraphUpdateWithoutDetailedNodesInput>, GraphUncheckedUpdateWithoutDetailedNodesInput>
  }

  export type GraphCreateNestedOneWithoutDetailedEdgesInput = {
    create?: XOR<GraphCreateWithoutDetailedEdgesInput, GraphUncheckedCreateWithoutDetailedEdgesInput>
    connectOrCreate?: GraphCreateOrConnectWithoutDetailedEdgesInput
    connect?: GraphWhereUniqueInput
  }

  export type GraphUpdateOneRequiredWithoutDetailedEdgesNestedInput = {
    create?: XOR<GraphCreateWithoutDetailedEdgesInput, GraphUncheckedCreateWithoutDetailedEdgesInput>
    connectOrCreate?: GraphCreateOrConnectWithoutDetailedEdgesInput
    upsert?: GraphUpsertWithoutDetailedEdgesInput
    connect?: GraphWhereUniqueInput
    update?: XOR<XOR<GraphUpdateToOneWithWhereWithoutDetailedEdgesInput, GraphUpdateWithoutDetailedEdgesInput>, GraphUncheckedUpdateWithoutDetailedEdgesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ArticleCreateWithoutJobInput = {
    id: string
    doi?: string | null
    title: string
    authors: string
    year?: number | null
    abstract?: string | null
    url?: string | null
    pdfUrl?: string | null
    source: string
    status: string
    screeningStatus?: string | null
    extractedData?: string | null
    entities?: string | null
    relations?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArticleUncheckedCreateWithoutJobInput = {
    id: string
    doi?: string | null
    title: string
    authors: string
    year?: number | null
    abstract?: string | null
    url?: string | null
    pdfUrl?: string | null
    source: string
    status: string
    screeningStatus?: string | null
    extractedData?: string | null
    entities?: string | null
    relations?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArticleCreateOrConnectWithoutJobInput = {
    where: ArticleWhereUniqueInput
    create: XOR<ArticleCreateWithoutJobInput, ArticleUncheckedCreateWithoutJobInput>
  }

  export type ArticleCreateManyJobInputEnvelope = {
    data: ArticleCreateManyJobInput | ArticleCreateManyJobInput[]
    skipDuplicates?: boolean
  }

  export type GraphCreateWithoutJobsInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    detailedNodes?: GraphNodeCreateNestedManyWithoutGraphInput
    detailedEdges?: GraphEdgeCreateNestedManyWithoutGraphInput
  }

  export type GraphUncheckedCreateWithoutJobsInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    detailedNodes?: GraphNodeUncheckedCreateNestedManyWithoutGraphInput
    detailedEdges?: GraphEdgeUncheckedCreateNestedManyWithoutGraphInput
  }

  export type GraphCreateOrConnectWithoutJobsInput = {
    where: GraphWhereUniqueInput
    create: XOR<GraphCreateWithoutJobsInput, GraphUncheckedCreateWithoutJobsInput>
  }

  export type ArticleUpsertWithWhereUniqueWithoutJobInput = {
    where: ArticleWhereUniqueInput
    update: XOR<ArticleUpdateWithoutJobInput, ArticleUncheckedUpdateWithoutJobInput>
    create: XOR<ArticleCreateWithoutJobInput, ArticleUncheckedCreateWithoutJobInput>
  }

  export type ArticleUpdateWithWhereUniqueWithoutJobInput = {
    where: ArticleWhereUniqueInput
    data: XOR<ArticleUpdateWithoutJobInput, ArticleUncheckedUpdateWithoutJobInput>
  }

  export type ArticleUpdateManyWithWhereWithoutJobInput = {
    where: ArticleScalarWhereInput
    data: XOR<ArticleUpdateManyMutationInput, ArticleUncheckedUpdateManyWithoutJobInput>
  }

  export type ArticleScalarWhereInput = {
    AND?: ArticleScalarWhereInput | ArticleScalarWhereInput[]
    OR?: ArticleScalarWhereInput[]
    NOT?: ArticleScalarWhereInput | ArticleScalarWhereInput[]
    id?: StringFilter<"Article"> | string
    jobId?: StringFilter<"Article"> | string
    doi?: StringNullableFilter<"Article"> | string | null
    title?: StringFilter<"Article"> | string
    authors?: StringFilter<"Article"> | string
    year?: IntNullableFilter<"Article"> | number | null
    abstract?: StringNullableFilter<"Article"> | string | null
    url?: StringNullableFilter<"Article"> | string | null
    pdfUrl?: StringNullableFilter<"Article"> | string | null
    source?: StringFilter<"Article"> | string
    status?: StringFilter<"Article"> | string
    screeningStatus?: StringNullableFilter<"Article"> | string | null
    extractedData?: StringNullableFilter<"Article"> | string | null
    entities?: StringNullableFilter<"Article"> | string | null
    relations?: StringNullableFilter<"Article"> | string | null
    createdAt?: DateTimeFilter<"Article"> | Date | string
    updatedAt?: DateTimeFilter<"Article"> | Date | string
  }

  export type GraphUpsertWithoutJobsInput = {
    update: XOR<GraphUpdateWithoutJobsInput, GraphUncheckedUpdateWithoutJobsInput>
    create: XOR<GraphCreateWithoutJobsInput, GraphUncheckedCreateWithoutJobsInput>
    where?: GraphWhereInput
  }

  export type GraphUpdateToOneWithWhereWithoutJobsInput = {
    where?: GraphWhereInput
    data: XOR<GraphUpdateWithoutJobsInput, GraphUncheckedUpdateWithoutJobsInput>
  }

  export type GraphUpdateWithoutJobsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    detailedNodes?: GraphNodeUpdateManyWithoutGraphNestedInput
    detailedEdges?: GraphEdgeUpdateManyWithoutGraphNestedInput
  }

  export type GraphUncheckedUpdateWithoutJobsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    detailedNodes?: GraphNodeUncheckedUpdateManyWithoutGraphNestedInput
    detailedEdges?: GraphEdgeUncheckedUpdateManyWithoutGraphNestedInput
  }

  export type ResearchJobCreateWithoutArticlesInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    graph?: GraphCreateNestedOneWithoutJobsInput
  }

  export type ResearchJobUncheckedCreateWithoutArticlesInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    graphId?: string | null
  }

  export type ResearchJobCreateOrConnectWithoutArticlesInput = {
    where: ResearchJobWhereUniqueInput
    create: XOR<ResearchJobCreateWithoutArticlesInput, ResearchJobUncheckedCreateWithoutArticlesInput>
  }

  export type ResearchJobUpsertWithoutArticlesInput = {
    update: XOR<ResearchJobUpdateWithoutArticlesInput, ResearchJobUncheckedUpdateWithoutArticlesInput>
    create: XOR<ResearchJobCreateWithoutArticlesInput, ResearchJobUncheckedCreateWithoutArticlesInput>
    where?: ResearchJobWhereInput
  }

  export type ResearchJobUpdateToOneWithWhereWithoutArticlesInput = {
    where?: ResearchJobWhereInput
    data: XOR<ResearchJobUpdateWithoutArticlesInput, ResearchJobUncheckedUpdateWithoutArticlesInput>
  }

  export type ResearchJobUpdateWithoutArticlesInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    graph?: GraphUpdateOneWithoutJobsNestedInput
  }

  export type ResearchJobUncheckedUpdateWithoutArticlesInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    graphId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ResearchJobCreateWithoutGraphInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    articles?: ArticleCreateNestedManyWithoutJobInput
  }

  export type ResearchJobUncheckedCreateWithoutGraphInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
    articles?: ArticleUncheckedCreateNestedManyWithoutJobInput
  }

  export type ResearchJobCreateOrConnectWithoutGraphInput = {
    where: ResearchJobWhereUniqueInput
    create: XOR<ResearchJobCreateWithoutGraphInput, ResearchJobUncheckedCreateWithoutGraphInput>
  }

  export type ResearchJobCreateManyGraphInputEnvelope = {
    data: ResearchJobCreateManyGraphInput | ResearchJobCreateManyGraphInput[]
    skipDuplicates?: boolean
  }

  export type GraphNodeCreateWithoutGraphInput = {
    id?: string
    label: string
    name: string
    data: string
  }

  export type GraphNodeUncheckedCreateWithoutGraphInput = {
    id?: string
    label: string
    name: string
    data: string
  }

  export type GraphNodeCreateOrConnectWithoutGraphInput = {
    where: GraphNodeWhereUniqueInput
    create: XOR<GraphNodeCreateWithoutGraphInput, GraphNodeUncheckedCreateWithoutGraphInput>
  }

  export type GraphNodeCreateManyGraphInputEnvelope = {
    data: GraphNodeCreateManyGraphInput | GraphNodeCreateManyGraphInput[]
    skipDuplicates?: boolean
  }

  export type GraphEdgeCreateWithoutGraphInput = {
    id?: string
    source: string
    target: string
    relation: string
    data: string
  }

  export type GraphEdgeUncheckedCreateWithoutGraphInput = {
    id?: string
    source: string
    target: string
    relation: string
    data: string
  }

  export type GraphEdgeCreateOrConnectWithoutGraphInput = {
    where: GraphEdgeWhereUniqueInput
    create: XOR<GraphEdgeCreateWithoutGraphInput, GraphEdgeUncheckedCreateWithoutGraphInput>
  }

  export type GraphEdgeCreateManyGraphInputEnvelope = {
    data: GraphEdgeCreateManyGraphInput | GraphEdgeCreateManyGraphInput[]
    skipDuplicates?: boolean
  }

  export type ResearchJobUpsertWithWhereUniqueWithoutGraphInput = {
    where: ResearchJobWhereUniqueInput
    update: XOR<ResearchJobUpdateWithoutGraphInput, ResearchJobUncheckedUpdateWithoutGraphInput>
    create: XOR<ResearchJobCreateWithoutGraphInput, ResearchJobUncheckedCreateWithoutGraphInput>
  }

  export type ResearchJobUpdateWithWhereUniqueWithoutGraphInput = {
    where: ResearchJobWhereUniqueInput
    data: XOR<ResearchJobUpdateWithoutGraphInput, ResearchJobUncheckedUpdateWithoutGraphInput>
  }

  export type ResearchJobUpdateManyWithWhereWithoutGraphInput = {
    where: ResearchJobScalarWhereInput
    data: XOR<ResearchJobUpdateManyMutationInput, ResearchJobUncheckedUpdateManyWithoutGraphInput>
  }

  export type ResearchJobScalarWhereInput = {
    AND?: ResearchJobScalarWhereInput | ResearchJobScalarWhereInput[]
    OR?: ResearchJobScalarWhereInput[]
    NOT?: ResearchJobScalarWhereInput | ResearchJobScalarWhereInput[]
    id?: StringFilter<"ResearchJob"> | string
    topic?: StringFilter<"ResearchJob"> | string
    mode?: StringFilter<"ResearchJob"> | string
    status?: StringFilter<"ResearchJob"> | string
    progress?: IntFilter<"ResearchJob"> | number
    error?: StringNullableFilter<"ResearchJob"> | string | null
    queries?: StringFilter<"ResearchJob"> | string
    articlesFound?: IntFilter<"ResearchJob"> | number
    articlesProcessed?: IntFilter<"ResearchJob"> | number
    startTime?: DateTimeNullableFilter<"ResearchJob"> | Date | string | null
    endTime?: DateTimeNullableFilter<"ResearchJob"> | Date | string | null
    createdAt?: DateTimeFilter<"ResearchJob"> | Date | string
    updatedAt?: DateTimeFilter<"ResearchJob"> | Date | string
    includedIds?: StringNullableFilter<"ResearchJob"> | string | null
    excludedIds?: StringNullableFilter<"ResearchJob"> | string | null
    exclusionReasons?: StringNullableFilter<"ResearchJob"> | string | null
    reviewText?: StringNullableFilter<"ResearchJob"> | string | null
    graphId?: StringNullableFilter<"ResearchJob"> | string | null
  }

  export type GraphNodeUpsertWithWhereUniqueWithoutGraphInput = {
    where: GraphNodeWhereUniqueInput
    update: XOR<GraphNodeUpdateWithoutGraphInput, GraphNodeUncheckedUpdateWithoutGraphInput>
    create: XOR<GraphNodeCreateWithoutGraphInput, GraphNodeUncheckedCreateWithoutGraphInput>
  }

  export type GraphNodeUpdateWithWhereUniqueWithoutGraphInput = {
    where: GraphNodeWhereUniqueInput
    data: XOR<GraphNodeUpdateWithoutGraphInput, GraphNodeUncheckedUpdateWithoutGraphInput>
  }

  export type GraphNodeUpdateManyWithWhereWithoutGraphInput = {
    where: GraphNodeScalarWhereInput
    data: XOR<GraphNodeUpdateManyMutationInput, GraphNodeUncheckedUpdateManyWithoutGraphInput>
  }

  export type GraphNodeScalarWhereInput = {
    AND?: GraphNodeScalarWhereInput | GraphNodeScalarWhereInput[]
    OR?: GraphNodeScalarWhereInput[]
    NOT?: GraphNodeScalarWhereInput | GraphNodeScalarWhereInput[]
    id?: StringFilter<"GraphNode"> | string
    graphId?: StringFilter<"GraphNode"> | string
    label?: StringFilter<"GraphNode"> | string
    name?: StringFilter<"GraphNode"> | string
    data?: StringFilter<"GraphNode"> | string
  }

  export type GraphEdgeUpsertWithWhereUniqueWithoutGraphInput = {
    where: GraphEdgeWhereUniqueInput
    update: XOR<GraphEdgeUpdateWithoutGraphInput, GraphEdgeUncheckedUpdateWithoutGraphInput>
    create: XOR<GraphEdgeCreateWithoutGraphInput, GraphEdgeUncheckedCreateWithoutGraphInput>
  }

  export type GraphEdgeUpdateWithWhereUniqueWithoutGraphInput = {
    where: GraphEdgeWhereUniqueInput
    data: XOR<GraphEdgeUpdateWithoutGraphInput, GraphEdgeUncheckedUpdateWithoutGraphInput>
  }

  export type GraphEdgeUpdateManyWithWhereWithoutGraphInput = {
    where: GraphEdgeScalarWhereInput
    data: XOR<GraphEdgeUpdateManyMutationInput, GraphEdgeUncheckedUpdateManyWithoutGraphInput>
  }

  export type GraphEdgeScalarWhereInput = {
    AND?: GraphEdgeScalarWhereInput | GraphEdgeScalarWhereInput[]
    OR?: GraphEdgeScalarWhereInput[]
    NOT?: GraphEdgeScalarWhereInput | GraphEdgeScalarWhereInput[]
    id?: StringFilter<"GraphEdge"> | string
    graphId?: StringFilter<"GraphEdge"> | string
    source?: StringFilter<"GraphEdge"> | string
    target?: StringFilter<"GraphEdge"> | string
    relation?: StringFilter<"GraphEdge"> | string
    data?: StringFilter<"GraphEdge"> | string
  }

  export type GraphCreateWithoutDetailedNodesInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jobs?: ResearchJobCreateNestedManyWithoutGraphInput
    detailedEdges?: GraphEdgeCreateNestedManyWithoutGraphInput
  }

  export type GraphUncheckedCreateWithoutDetailedNodesInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jobs?: ResearchJobUncheckedCreateNestedManyWithoutGraphInput
    detailedEdges?: GraphEdgeUncheckedCreateNestedManyWithoutGraphInput
  }

  export type GraphCreateOrConnectWithoutDetailedNodesInput = {
    where: GraphWhereUniqueInput
    create: XOR<GraphCreateWithoutDetailedNodesInput, GraphUncheckedCreateWithoutDetailedNodesInput>
  }

  export type GraphUpsertWithoutDetailedNodesInput = {
    update: XOR<GraphUpdateWithoutDetailedNodesInput, GraphUncheckedUpdateWithoutDetailedNodesInput>
    create: XOR<GraphCreateWithoutDetailedNodesInput, GraphUncheckedCreateWithoutDetailedNodesInput>
    where?: GraphWhereInput
  }

  export type GraphUpdateToOneWithWhereWithoutDetailedNodesInput = {
    where?: GraphWhereInput
    data: XOR<GraphUpdateWithoutDetailedNodesInput, GraphUncheckedUpdateWithoutDetailedNodesInput>
  }

  export type GraphUpdateWithoutDetailedNodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobs?: ResearchJobUpdateManyWithoutGraphNestedInput
    detailedEdges?: GraphEdgeUpdateManyWithoutGraphNestedInput
  }

  export type GraphUncheckedUpdateWithoutDetailedNodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobs?: ResearchJobUncheckedUpdateManyWithoutGraphNestedInput
    detailedEdges?: GraphEdgeUncheckedUpdateManyWithoutGraphNestedInput
  }

  export type GraphCreateWithoutDetailedEdgesInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jobs?: ResearchJobCreateNestedManyWithoutGraphInput
    detailedNodes?: GraphNodeCreateNestedManyWithoutGraphInput
  }

  export type GraphUncheckedCreateWithoutDetailedEdgesInput = {
    id: string
    name: string
    description?: string | null
    version?: string
    directed?: boolean
    nodes: string
    edges: string
    metrics?: string | null
    sources?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jobs?: ResearchJobUncheckedCreateNestedManyWithoutGraphInput
    detailedNodes?: GraphNodeUncheckedCreateNestedManyWithoutGraphInput
  }

  export type GraphCreateOrConnectWithoutDetailedEdgesInput = {
    where: GraphWhereUniqueInput
    create: XOR<GraphCreateWithoutDetailedEdgesInput, GraphUncheckedCreateWithoutDetailedEdgesInput>
  }

  export type GraphUpsertWithoutDetailedEdgesInput = {
    update: XOR<GraphUpdateWithoutDetailedEdgesInput, GraphUncheckedUpdateWithoutDetailedEdgesInput>
    create: XOR<GraphCreateWithoutDetailedEdgesInput, GraphUncheckedCreateWithoutDetailedEdgesInput>
    where?: GraphWhereInput
  }

  export type GraphUpdateToOneWithWhereWithoutDetailedEdgesInput = {
    where?: GraphWhereInput
    data: XOR<GraphUpdateWithoutDetailedEdgesInput, GraphUncheckedUpdateWithoutDetailedEdgesInput>
  }

  export type GraphUpdateWithoutDetailedEdgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobs?: ResearchJobUpdateManyWithoutGraphNestedInput
    detailedNodes?: GraphNodeUpdateManyWithoutGraphNestedInput
  }

  export type GraphUncheckedUpdateWithoutDetailedEdgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    directed?: BoolFieldUpdateOperationsInput | boolean
    nodes?: StringFieldUpdateOperationsInput | string
    edges?: StringFieldUpdateOperationsInput | string
    metrics?: NullableStringFieldUpdateOperationsInput | string | null
    sources?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobs?: ResearchJobUncheckedUpdateManyWithoutGraphNestedInput
    detailedNodes?: GraphNodeUncheckedUpdateManyWithoutGraphNestedInput
  }

  export type ArticleCreateManyJobInput = {
    id: string
    doi?: string | null
    title: string
    authors: string
    year?: number | null
    abstract?: string | null
    url?: string | null
    pdfUrl?: string | null
    source: string
    status: string
    screeningStatus?: string | null
    extractedData?: string | null
    entities?: string | null
    relations?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArticleUpdateWithoutJobInput = {
    id?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArticleUncheckedUpdateWithoutJobInput = {
    id?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArticleUncheckedUpdateManyWithoutJobInput = {
    id?: StringFieldUpdateOperationsInput | string
    doi?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    authors?: StringFieldUpdateOperationsInput | string
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    pdfUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    screeningStatus?: NullableStringFieldUpdateOperationsInput | string | null
    extractedData?: NullableStringFieldUpdateOperationsInput | string | null
    entities?: NullableStringFieldUpdateOperationsInput | string | null
    relations?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResearchJobCreateManyGraphInput = {
    id: string
    topic: string
    mode: string
    status: string
    progress: number
    error?: string | null
    queries: string
    articlesFound: number
    articlesProcessed: number
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    includedIds?: string | null
    excludedIds?: string | null
    exclusionReasons?: string | null
    reviewText?: string | null
  }

  export type GraphNodeCreateManyGraphInput = {
    id?: string
    label: string
    name: string
    data: string
  }

  export type GraphEdgeCreateManyGraphInput = {
    id?: string
    source: string
    target: string
    relation: string
    data: string
  }

  export type ResearchJobUpdateWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    articles?: ArticleUpdateManyWithoutJobNestedInput
  }

  export type ResearchJobUncheckedUpdateWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
    articles?: ArticleUncheckedUpdateManyWithoutJobNestedInput
  }

  export type ResearchJobUncheckedUpdateManyWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    progress?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    queries?: StringFieldUpdateOperationsInput | string
    articlesFound?: IntFieldUpdateOperationsInput | number
    articlesProcessed?: IntFieldUpdateOperationsInput | number
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    includedIds?: NullableStringFieldUpdateOperationsInput | string | null
    excludedIds?: NullableStringFieldUpdateOperationsInput | string | null
    exclusionReasons?: NullableStringFieldUpdateOperationsInput | string | null
    reviewText?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GraphNodeUpdateWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphNodeUncheckedUpdateWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphNodeUncheckedUpdateManyWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphEdgeUpdateWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphEdgeUncheckedUpdateWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }

  export type GraphEdgeUncheckedUpdateManyWithoutGraphInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    target?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ResearchJobCountOutputTypeDefaultArgs instead
     */
    export type ResearchJobCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ResearchJobCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GraphCountOutputTypeDefaultArgs instead
     */
    export type GraphCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GraphCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ResearchJobDefaultArgs instead
     */
    export type ResearchJobArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ResearchJobDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ArticleDefaultArgs instead
     */
    export type ArticleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ArticleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GraphDefaultArgs instead
     */
    export type GraphArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GraphDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GraphNodeDefaultArgs instead
     */
    export type GraphNodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GraphNodeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GraphEdgeDefaultArgs instead
     */
    export type GraphEdgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GraphEdgeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SystemConfigDefaultArgs instead
     */
    export type SystemConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SystemConfigDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}