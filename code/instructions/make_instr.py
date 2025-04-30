n_periods = 10
practice_n_periods = 2


inst = [
        "<p style='text-align:center'>Welcome to the Stock Investment Game!</p>" + #"<p style='text-align:center'><img src='imgs/style3_fast.gif' style='width:500px'></img></p>" + 
        "<p>In this game, you have to invest in  stocks based on a stream of incoming information. The better your investment strategy, the more money you will earn!</p>" + "<p>Please close as many other tabs and windows as possible, and make your browser window full screen (in some browsers this is done by hitting F11). Read the following instructions carefully! It will help you earn more money.</p><p>People who pay attention to this task earn over twice as much money as people who don't.</p><p>Please stay engaged during this task. If you need to take breaks, there are opportunities to do so between each period.</p>",
        "<p style='text-align:center'><img src='imgs/style_instructions_factors3.png' style='width:800px'></img></p>" + "<p>This game has " + str(n_periods) + " periods. In each period, you will be shown information about several 'factors' that determine the values of various stocks. There is a specific factor for each stock, and there is one additional factor that describes the market index that respresents the returns of the market as a whole. (These could be shown in a different order than in the image, but that doesn't change anything about what they mean.)</p>",
        "<p style='text-align:center'><img src='imgs/style_instructions_prior_var.png' style='width:800px'></img></p>" + "<p>Across periods, each factor might vary a lot or a little. This is indicated by the sideways bell curves, which can be wider (if the true factor values could be very big) or narrower (if they are likely close to zero).</p>" + "<p>What happens in one period has no effect on what happens in any other period.</p>",
        "<p style='text-align:center'><img src='imgs/style_instructions_mean.png' style='width:800px'></img></p>" + "<p>Your task in each period is to predict the total value of each stock. This is equal to its stock-specific factor plus the index factor.</p>" + "<p>For example, if the index factor were 10 and the stock-specific factors for A and B were &#8722;16 and &#8722;53, then the total values of Stocks A and B would be &#8722;6 (= &#8722;16 + 10) and &#8722;43 (= &#8722;53 + 10).<br>(Note: you will not make a prediction about the index factor on its own, but it will contribute to each stock's total value.)</p>" + "<p>However, you will not be given the exact factor values, and instead have to learn about them.</p>",
        "<p style='text-align:center'><img src='imgs/style_instructions_mouse.gif' style='width:800px'></img></p>" + "<p>You have a limited amount of time to learn about the factors. You learn about a factor by mousing over it. The longer your mouse is over a factor, the more information about it you will see.</p>" + "<p>The pieces of information you receive don't tell you the true factor value exactly, but they are useful clues. Their average is equal to the true factor value. To improve your predictions, you may decide to gather a lot of information about some factors, and a little information (or even none at all) about others.</p>",
        # "<p style='text-align:center'><img src='imgs/style_instructions_prior.png' style='width:800px'></img></p>" + "<p>Across periods, each factor might vary a lot or a little. (Note: this is different from the moment-to-moment randomness in the pieces of information you receive.) This is indicated by the sideways bell curves, which can be wider (if the true factor values could be very large) or narrower (if they are likely to be small).</p>" + "<p>What happens in one period has no effect on what happens in any other period.</p>",
        "<p style='text-align:center'><img src='imgs/style_instructions_invest.png' style='width:800px'></img></p>" +
            "<p>When the timer runs out in each period, you will be asked to invest in the stocks. You will be given 100 units of cash to invest in the stock as shown in the table on the left next to \"ENDOWMENT\"." +
            " Make investments by entering your desired amount into the text boxes next to the stock name." +
"As you invest funds, you will see your remaining \"BALANCE\" adjust.  When you have invested all funds, click the <b>SUBMIT</b> button at the bottom of the screen.",

        "<p style='text-align:center'><img src='imgs/style_instructions_returns.png' style='width:800px'></img></p>" + 
        "<p>After submitting your investments , you will be shown the true stock returns of each stock and the amount each investment is worth after the returns are calculated" + 
        " Note that stock returns can be negative so your investments might lose value." +
        "The table on the left will shown your total results for this round next to \"RESULT\".</p>" +
        "<p>When you are finished with this page, click the <b>NEXT</b> button at the bottom of the page to continue to the next round.  <\p>" + 
        "<p> You will be paid a bonus payment based on the cummulated returns that you experience on your investments throughout this experiment</p>",

        "<p>You will now get " + str(practice_n_periods) + " practice trials. They are self-paced, and will not have any impact on your earnings. When you are ready to start the practice trials, click 'Next'.</p>" + "<p>If you want the display to be larger, you can zoom in with your web browser during the practice trials. Depending on your browser and operating system, this might be done by hitting 'Ctrl' and '+' at the same time, or 'Cmd' and '+'. (You can do the opposite with 'Ctrl' + '&#8722;'.)</p>",
        ];

for i in range(len(inst)):
    f_name = f"instr_{i}.txt"
    instruction = inst[i].replace('<', '\n<')
    with open(f_name, "w") as f:
        f.write(instruction)
