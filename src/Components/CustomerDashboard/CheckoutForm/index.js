import { Dialog } from "@mui/material";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import ENVIRONMENT_VARIABLES from "../../../environment.config";

const CheckoutForm = (props) => {
  const stripePromise = loadStripe(ENVIRONMENT_VARIABLES.Base_STRIPE_KEY);

  return (
    <div>
      <Dialog open={true} onClose={props.handleClosePaymentPopup}>
        <div id="checkout">
          {props.stripePayment !== null && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret: props.stripePayment }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default CheckoutForm;
