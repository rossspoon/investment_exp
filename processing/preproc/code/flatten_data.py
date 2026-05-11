import pandas as pd
import matplotlib.pyplot as plt
import zipfile
import numpy as np
import ast

with zipfile.ZipFile('/Users/rossspoon/Downloads/data_export.zip', 'r') as z:
    csv_files = [f for f in z.namelist() if f.endswith('.csv')]
    df = pd.concat([pd.read_csv(z.open(f)) for f in csv_files], ignore_index=True)

v = df[df.stage=='view_real']

cols_for_stage = {
    'invest': {'double': ['returns', 'investments', 'results',],
               'single': ['total_result', 'doneTime',  'userStart', 'balance', ]}
    }


def split_npr(row):
    a_val_lst = []
    a_t_lst = []
    b_val_lst = []
    b_t_lst = []
    
    if pd.isna(row.npr_index):
        return '' ,'', '', ''
    
    npr_index  = [x for x in row.npr_index.split(',')]
    npr_val = [x for x in row.npr_val.split(',')]
    npr_time  = [x for x in row.npr_time.split(',')]
        
    for idx, val, t in zip(npr_index, npr_val, npr_time):
        if idx == '0':
            a_val_lst.append(val)
            a_t_lst.append(t)
        else:
            b_val_lst.append(val)
            b_t_lst.append(t)

    a_val = ','.join(a_val_lst)
    a_t   = ','.join(a_t_lst)
    b_val = ','.join(b_val_lst)
    b_t   = ','.join(b_t_lst)
    return a_val, a_t, b_val, b_t


def split_cell_i(row, col):
    return [int(x) for x in row[col].split(',')]

def split_cell_f(row, col):
    return [float(x) for x in row[col].split(',')]

def split_cell_s(row, col):
    return [x for x in row[col].split(',')]


def split_invest_row(row):
    # get the names of the stocks.  We need to order these based on #random_order_stocks
    names = split_cell_s(row, 'names')
    ros = split_cell_i(row, 'random_order_stocks')
    names = [names[ros[0]], names[ros[1]]]
    names = ['name'] + names
    
    returns = ['return'] + split_cell_i(row, 'returns')
    investments = ['investment'] + split_cell_i(row, 'investments')
    results = ['result'] + split_cell_f(row, 'results')
    doubles = [names, returns, investments, results]
    
    # setting the index moves the fist column to the index
    # transposing it turns that index into columns
    split_df = pd.DataFrame(doubles).set_index(0).T
    
    for c in ['subject', 'period', 'total_result', 'doneTime',  'userStart', 'balance', ]:
        split_df[c] = row[c]
    #split_df['stage'] = row.stage
        
    return split_df[['subject', 'period', 'name', 'return', 'investment', 'result', 'total_result', 'doneTime',  'userStart', 'balance']].copy()


def split_view_row(row):
    
    doubles = [
        ['name'] + split_cell_s(row, 'names'),
        ['prior_mean'] + split_cell_i(row, 'prior_mean'),
        ['prior_std'] + split_cell_i(row, 'prior_std'),
        ['noise_std'] + split_cell_i(row, 'noise_std'),
        ['frequency'] + split_cell_i(row, 'frequency'),
        ['factor_val'] + split_cell_i(row, 'factor_val'),
    ]
    split_df = pd.DataFrame(doubles).set_index(0).T
    
    ## Split NPR values and timestamps
    a_val, a_t, b_val, b_t = split_npr(row)
    split_df['signal'] = [a_val, b_val]
    split_df['signal_t'] = [a_t, b_t]
    
    single_cols = ['subject', 'period', 'n_firms', 'n_periods', 'time', 'condition']
    for c in single_cols:
        split_df[c] = row[c]
    #split_df['stage'] = row.stage

    return split_df


def process_survey(data):
    surv_data = data[data.trial_type.str.contains('survey')]
    if surv_data.shape[0] == 0:
        return None
    
    surv_data = surv_data.loc[:,  ['stage', 'subject', 'responses']]
    # The lambe will set the index to stage and transpose it so the index becomes columns
    surv = surv_data.groupby('subject').apply(lambda x: x.set_index('stage').T)
    
    surv = surv.reset_index(level=1, drop=True)  # The previous step leaves a multidex and we don't need the second level
    comprehension = surv['comprehension'].apply(ast.literal_eval).apply(pd.Series)
    surv = pd.concat([surv, comprehension], axis=1)
    surv = surv.drop(columns=['comprehension'])
    return surv


####
## Process File
df['period'] = df['period'].fillna(0).astype(int)

invest_rows = []
for _, r in df[df.stage=='invest'].iterrows():
    invest_rows.append(split_invest_row(r))
invest_df = pd.concat(invest_rows)
invest_df.set_index(['subject', 'period', 'name'], inplace=True) 


view_rows = []
for _, r in df[df.stage=='view_real'].iterrows():
    view_rows.append(split_view_row(r))
view_df = pd.concat(view_rows)
view_df.set_index(['subject', 'period', 'name'], inplace=True) 


surv_df = process_survey(df)

if surv_df:
    flat_df = view_df.join(invest_df).join(surv_df)
else:
    flat_df = view_df.join(invest_df)



def add_std(ax, data, std_config, std_relalized, fontsize=12):
    x_min, x_max = ax.get_xlim()
    y_min, y_max = ax.get_ylim()
    ax.text(
        x_max - 0.05 * (x_max - x_min),  # 5% from the right edge
        y_max - 0.05 * (y_max - y_min),  # 5% from the top edge
        f'STD (configured): {std_config:.0f}\nSTD (realized): {std_relalized:.0f}',
        ha='right',
        va='top',
        fontsize=fontsize,
    )

def plot_npr(grp):
    named_rows = grp.reset_index().groupby('name').first()
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    row = named_rows.loc['Stock A']
    vals = [int(x) for x in row.signal.split(',')]
    std_relalized = np.std(vals)
    ax1.hist(vals, bins=30, color='steelblue', edgecolor='white')
    ax1.axvline(row['return'], c='red', linestyle='--', label=f"Return A: {row['return']}")
    ax1.set_title('Stock A')
    ax1.set_xlabel('Value')
    ax1.set_ylabel('Count')
    add_std(ax1, vals, row.noise_std, std_relalized)
    ax1.legend(fontsize=12, loc='upper left')
    
    row = named_rows.loc['Stock B']
    vals = [int(x) for x in row.signal.split(',')]
    std_relalized = np.std(vals)
    ax2.hist(vals, bins=30, color='salmon', edgecolor='white')
    ax2.axvline(row['return'], c='red', linestyle='--', label=f"Return B: {row['return']}")
    ax2.set_title('Stock B')
    ax2.set_xlabel('Value')
    ax2.set_ylabel('Count')
    add_std(ax2, vals, row.noise_std, std_relalized)
    ax2.legend(fontsize=12, loc='upper left')
    
    condition = 'Treatment' if row.condition == 'T' else 'Control'
    fig.suptitle(f"Period {row.period:.0f} out of {row.n_periods:.0f} ({condition})", fontsize=16)
    
    plt.tight_layout()
    plt.show()
    

flat_df.groupby(level=[0,1]).apply(plot_npr)
