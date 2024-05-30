import { jsonParse } from "postgraphile/@dataplan/json";
import { context, lambda, constant, listen } from "postgraphile/grafast";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const FooSubscriptionPlugin = makeExtendSchemaPlugin(() => {
  return {
    typeDefs: gql`
        extend type Subscription {
            foo(fooId: Int!): FooSubscriptionPayload
        }

        type FooSubscriptionPayload {
            event: String
            foo: Boolean
        }
    `,
    plans: {
      Subscription: {
        foo: {
          subscribePlan(_$root, args) {
            const $pgSubscriber = context().get("pgSubscriber");
            const $fooId = args.get("fooId");
            const $topic = lambda(
              $fooId,
              (records: number) => {
                const some_access_check = false;
                if (!some_access_check) {
                  console.log('Error being thrown');
                  throw new Error("This should be relayed to the mapError");
                }

                return 'foo:bar'
              });

            return listen($pgSubscriber, $topic, jsonParse);
          },
          plan($event) {
            return $event;
          }
        }
      },
      FooSubscriptionPayload: {
        event($event) {
          return $event.get("event");
        },
        foo($event) {
          return constant(true);
        }
      }
    }
  };
});
