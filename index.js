class Qbuild{
    constructor(main_table) {
        this.main_table = main_table;
        this.init();
    }

    init(){
        this._select = [];
        this._where = [];
        this._join = [];
        this._groupby = [];
        this._wherein = [];
        this._orderby = [];
    }

    select(params){
        if (typeof params != 'Object')
            this._select.push(params);
        else
            this._select.push(...params);

        return this;
    }

    join(table, conj, join_type = 'none'){
        this._join.push([table, conj, join_type]);
        return this;
    }

    where(col, cond = '=', val){
        this._where.push([col, cond, val]);
        return this;
    }

    whereIn(col, values, not = false){
        this._wherein.push([col, values, not]);
        return this;
    }

    orderBy(col, ord = 'ASC'){
        this._orderby.push([col, ord]);
        return this;
    }

    group_by(param){
        if(typeof param !== 'object'){
            this._groupby(param);
        }
        else{
            this._groupby.push(...param);
        }
        return this;
    }

    build_query(){
        /* select */
        let query_select = this._select.reduce((accm, val) => {
            if(accm != '') accm += `, ${val}`;
            else accm += `${val}`;
            return accm;
        }, '');
        if(query_select == '') query_select = '*';

        /* group by */
        let query_groupby = this._groupby.reduce((accm, val) => {
            if(accm != '')  accm += `, ${val}`;
            else accm += `${val}`;
            return accm;
        }, '');
        if(query_groupby != '') query_groupby = ` GROUP BY ${query_groupby}`;


        /* join */
        let query_join = this._join.reduce((accm, val) => {
            if(val[2] == 'none')
                accm += ` JOIN ${val[0]} ON ${val[1]}`;
            else
                accm += ` ${val[2]} JOIN ${val[0]} ON ${val[1]}`;
            return accm;
        }, '');

        /* where */
        let query_where = this._where.reduce((accm, val) => {
            const val_2 = typeof val[2] != 'string' ? val[2] : `'${val[2]}'`;
            if (accm != '') accm += ` AND ${val[0]} ${val[1]} ${val_2}`;
            else accm += `${val[0]} ${val[1]} ${val_2}`;
            return accm;
        }, '')
        query_where = query_where != '' ? ` WHERE ${query_where}` : '';

        /* whereIn */
        if(query_where != ''){
            query_where += ' ' + this._wherein.reduce((accm, val) => {
                if(accm != '')  accm += ' AND ';
                const whereinvalue = val[1].reduce((accm2, val2) => {
                    if (val2 != '') accm2 += ' , ';

                    if(typeof val2 === 'string')    accm2 += ` '${val2}' `;
                    else accm2 += ` ${val2} `;

                    return accm2;
                }, '')
                accm += `${val[0]} ${val[2] ? 'not' : ''} in (${whereinvalue})`
                return accm;
            }, '')
        }

        /* order by */
        let query_orderby = this._orderby.reduce((accm, v) => {
            if(accm == '')  accm += ' ORDER BY ';
            accm += ` ${v[0]} ${v[1]}`
            return accm;
        }, '')

            /* return */
        return `SELECT ${query_select} FROM ${this.main_table} ${query_join} ${query_where} ${query_groupby} ${query_orderby}`;
    }
}

module.exports = Qbuild
